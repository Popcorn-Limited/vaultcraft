import {
  Dispatch,
  FormEventHandler,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { PlusIcon } from "@heroicons/react/24/outline";
import TokenIcon from "@/components/common/TokenIcon";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { BalancerOracleAbi, ZERO } from "@/lib/constants";
import { ExerciseByChain, ExerciseOracleByChain, OVCX_ORACLE, OptionTokenByChain, VCX, VcxByChain, WETH, WethByChain } from "@/lib/constants/addresses";
import { handleSwitchChain, NumberFormatter, validateInput } from "@/lib/utils/helpers";
import { Token } from "@/lib/types";
import { Address, createPublicClient, formatEther, http, parseEther, parseUnits } from "viem";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";
import ActionSteps from "@/components/vault/ActionSteps";
import { ActionStep, EXERCISE_OVCX_STEPS } from "@/lib/getActionSteps";
import MainActionButton from "@/components/button/MainActionButton";
import { exerciseOPop } from "@/lib/optionToken/interactions";
import { handleAllowance } from "@/lib/approve";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { mainnet } from "viem/chains";
import SpinningLogo from "@/components/common/SpinningLogo";

const SLIPPAGE = 0.01; // @dev adding some slippage to the call -- TODO -> we should later allow users to change that

interface ExerciseOptionTokenInterfaceProps {
  chainId: number;
  setShowModal: Function;
}

export default function ExerciseOptionTokenInterface({ chainId, setShowModal }: ExerciseOptionTokenInterfaceProps): JSX.Element {
  const { switchChainAsync } = useSwitchChain();
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [tokens, setTokens] = useAtom(tokensAtom)

  const [ovcx, setOvcx] = useState<Token>();
  const [weth, setWeth] = useState<Token>();

  const [strikePrice, setStrikePrice] = useState<number>(0);
  const [oVcxDiscount, setOVcxDiscount] = useState<number>(0);
  const [vcxPrice, setVCXPrice] = useState<number>(0);
  const [wethPrice, setWethPrice] = useState<number>(0);

  const [stepCounter, setStepCounter] = useState<number>(0);
  const [steps, setSteps] = useState<ActionStep[]>(EXERCISE_OVCX_STEPS);

  const [amount, setAmount] = useState<string>("0");
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<string>("0");

  useEffect(() => {
    async function setUpPrices() {

      setOvcx(tokens[chainId][OptionTokenByChain[chainId]])
      setWeth(tokens[chainId][WethByChain[chainId]])

      const mainnetClient = createPublicClient({ chain: mainnet, transport: http(RPC_URLS[1]) })

      const multiplier = await mainnetClient.readContract({
        address: OVCX_ORACLE,
        abi: BalancerOracleAbi,
        functionName: "multiplier",
      });
      const strikePriceRes = await createPublicClient({ chain: ChainById[chainId], transport: http(RPC_URLS[chainId]) }).readContract({
        address: ExerciseOracleByChain[chainId],
        abi: BalancerOracleAbi,
        functionName: "getPrice",
      });

      const strikePriceInUsd = (Number(strikePriceRes) * tokens[1][WETH].price) / 1e18;

      setWethPrice(tokens[1][WETH].price);
      setVCXPrice(tokens[1][VCX].price);
      setStrikePrice(strikePriceInUsd);
      setOVcxDiscount(multiplier);
    }
    if (chainId && Object.keys(tokens).length > 0) setUpPrices();
  }, [chainId, account, tokens]);

  function handleMaxWeth() {
    if (!weth) return
    setMaxPaymentAmount(weth.balance.formatted);
    setAmount(getOPopAmount(Number(weth.balance.formatted)));
  }

  function handleMaxOPop() {
    if (!ovcx) return
    setMaxPaymentAmount(getMaxPaymentAmount(Number(ovcx.balance.formatted)));
    setAmount(ovcx.balance.formatted);
  }

  function getMaxPaymentAmount(oVcxAmount: number) {
    const oVcxValue = oVcxAmount * strikePrice;

    return String((oVcxValue / wethPrice) * (1 + SLIPPAGE));
  }

  function getOPopAmount(paymentAmount: number) {
    const ethValue = paymentAmount * wethPrice;

    return String((ethValue / strikePrice) * (1 - SLIPPAGE));
  }

  const handleOPopInput: FormEventHandler<HTMLInputElement> = ({
    currentTarget: { value },
  }) => {
    const amount = validateInput(value).isValid ? value : "0";
    setAmount(amount);
    setMaxPaymentAmount(getMaxPaymentAmount(Number(amount)));
  };

  const handleEthInput: FormEventHandler<HTMLInputElement> = ({
    currentTarget: { value },
  }) => {
    const amount = validateInput(value).isValid ? value : "0";
    setMaxPaymentAmount(amount);
    setAmount(getOPopAmount(Number(amount)));
  };

  async function handleExerciseOptionToken() {
    if (!account) return;

    if (chain?.id !== chainId) {
      try {
        await switchChainAsync?.({ chainId });
      } catch (error) {
        return;
      }
    }

    const stepsCopy = [...steps];
    const currentStep = stepsCopy[stepCounter];
    currentStep.loading = true;
    setSteps(stepsCopy);

    let success = false;
    switch (stepCounter) {
      case 0:
        success = await handleAllowance({
          token: WethByChain[chainId],
          amount: parseUnits(maxPaymentAmount, 18),
          account: account as Address,
          spender: ExerciseByChain[chainId],
          clients: {
            publicClient: publicClient!,
            walletClient: walletClient!,
          },
        });
        break;
      case 1:
        success = chainId === mainnet.id || await handleAllowance({
          token: OptionTokenByChain[chainId],
          amount: parseUnits(amount, 18),
          account: account as Address,
          spender: ExerciseByChain[chainId],
          clients: {
            publicClient: publicClient!,
            walletClient: walletClient!,
          },
        });
        break;
      case 2:
        success = await exerciseOPop({
          account: account as Address,
          amount: BigInt(
            (Number(amount) * 10 ** 18).toLocaleString("fullwide", { useGrouping: false })
          ),
          maxPaymentAmount: parseEther(maxPaymentAmount),
          address: ExerciseByChain[chainId],
          clients: { publicClient: publicClient!, walletClient: walletClient! },
        });
        if (success) {
          await mutateTokenBalance({
            tokensToUpdate: [VcxByChain[chainId], WethByChain[chainId], OptionTokenByChain[chainId]],
            account,
            tokensAtom: [tokens, setTokens],
            chainId
          })
        }
        break;
    }

    currentStep.loading = false;
    currentStep.success = success;
    currentStep.error = !success;
    const newStepCounter = stepCounter + 1;
    setSteps(stepsCopy);
    setStepCounter(newStepCounter);
  }

  function closeModal() {
    setAmount("0");
    setMaxPaymentAmount("0");
    setStepCounter(0);
    setSteps({ ...EXERCISE_OVCX_STEPS });
    setShowModal(false)
  }

  return (
    <div className="mb-8 text-start">
      <h2 className="text-start text-5xl">Exercise oVCX</h2>
      {!!ovcx && !!weth ? (
        <>
          <p className="text-white font-semibold">
            Strike Price: $ {NumberFormatter.format(strikePrice)} | oVCX Price: ${" "}
            {NumberFormatter.format(vcxPrice - strikePrice)} | VCX Price: $ {NumberFormatter.format(vcxPrice)} | Discount:{" "}
            {((1 - (strikePrice / vcxPrice)) * 100).toFixed(2)} %
          </p>

          <div className="mt-8">
            <InputTokenWithError
              captionText={"Amount oVCX"}
              onSelectToken={() => { }}
              onMaxClick={handleMaxOPop}
              chainId={chainId}
              value={amount}
              onChange={handleOPopInput}
              allowInput={true}
              selectedToken={ovcx}
              errorMessage={
                Number(amount) > Number(ovcx.balance.formatted)
                  ? "Insufficient Balance"
                  : ""
              }
              tokenList={[]}
            />
            <div className="flex justify-center mt-4">
              <PlusIcon className="w-8 h-8 text-customGray500" />
            </div>

            <InputTokenWithError
              captionText={"Amount WETH"}
              onSelectToken={() => { }}
              onMaxClick={handleMaxWeth}
              chainId={chainId}
              value={maxPaymentAmount}
              onChange={handleEthInput}
              allowInput={true}
              selectedToken={weth}
              tokenList={[]}
              errorMessage={
                Number(maxPaymentAmount) > Number(weth.balance.formatted)
                  ? "Insufficient Balance"
                  : ""
              }
            />
          </div>

          <div className="relative -mt-10 -mb-10">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-customGray500" />
            </div>
            <div className={`relative flex justify-center my-12`}>
              <div className="w-20 bg-customNeutral200">
                <div className="flex items-center w-14 h-14 mx-auto justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="25"
                    viewBox="0 0 24 25"
                    fill="none"
                  >
                    <path
                      d="M19 14.1699L12 21.1699M12 21.1699L5 14.1699M12 21.1699L12 3.16992"
                      stroke="#6b7280"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-white">Received VCX</p>
            <div
              className={`w-full flex flex-row px-5 py-4 items-center justify-between rounded-lg border border-customGray500`}
            >
              <p>{amount}</p>
              <span className={`flex flex-row items-center justify-end`}>
                <div className="md:mr-2 relative">
                  <TokenIcon
                    token={{ logoURI: "/images/tokens/vcx.svg" } as Token}
                    imageSize="w-5 h-5"
                    chainId={1}
                  />
                </div>
                <p className="font-medium text-lg leading-none hidden md:block text-white group-hover:text-primaryGreen">
                  VCX
                </p>
              </span>
            </div>
          </div>

          <div className="flex flex-row mx-auto w-1/3 justify-center my-6">
            <ActionSteps
              steps={EXERCISE_OVCX_STEPS}
              stepCounter={stepCounter}
            />
          </div>
          <div className="mb-4">
            {chain?.id === chainId
              ? <>
                {stepCounter < EXERCISE_OVCX_STEPS.length ? (
                  <MainActionButton
                    label={steps[stepCounter].label}
                    handleClick={handleExerciseOptionToken}
                  //disabled={amount === "0" || maxPaymentAmount === "0"}
                  />
                ) : (
                  <MainActionButton
                    label={"Close Modal"}
                    handleClick={closeModal}
                  />
                )}
              </>
              : <MainActionButton
                label="Switch Chain"
                handleClick={() => handleSwitchChain(chainId, switchChainAsync)}
              />
            }
          </div>
          <span className="flex flex-row items-center justify-between pb-6 border-b border-customNeutral100"></span>
        </>)
        : <SpinningLogo />
      }
    </div>
  );
}
