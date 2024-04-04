import {
  Dispatch,
  FormEventHandler,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useAccount, useBalance, usePublicClient } from "wagmi";
import { PlusIcon } from "@heroicons/react/24/outline";
import TokenIcon from "@/components/common/TokenIcon";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { BalancerOracleAbi, OVCX_ORACLE, OptionTokenByChain, VCX, WETH, ZERO } from "@/lib/constants";
import { formatNumber, safeRound } from "@/lib/utils/formatBigNumber";
import { validateInput } from "@/lib/utils/helpers";
import { Token } from "@/lib/types";
import { formatEther } from "viem";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";

const SLIPPAGE = 0.01; // @dev adding some slippage to the call -- TODO -> we should later allow users to change that

interface ExerciseOptionTokenInterfaceProps {
  amountState: [string, Dispatch<SetStateAction<string>>];
  maxPaymentAmountState: [string, Dispatch<SetStateAction<string>>];
}

export default function ExerciseOptionTokenInterface({
  amountState,
  maxPaymentAmountState,
}: ExerciseOptionTokenInterfaceProps): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();

  const [tokens] = useAtom(tokensAtom)

  const [amount, setAmount] = amountState;
  const [maxPaymentAmount, setMaxPaymentAmount] = maxPaymentAmountState;

  const { data: oVcxBal } = useBalance({
    chainId: 1,
    address: account,
    token: OptionTokenByChain[1],
  });
  const { data: wethBal } = useBalance({
    chainId: 1,
    address: account,
    token: WETH,
  });

  const [strikePrice, setStrikePrice] = useState<number>(0);
  const [oVcxDiscount, setOVcxDiscount] = useState<number>(0);
  const [vcxPrice, setVCXPrice] = useState<number>(0);
  const [wethPrice, setWethPrice] = useState<number>(0);

  const [initialLoad, setInitialLoad] = useState<boolean>(false);

  useEffect(() => {
    async function setUpPrices() {
      setInitialLoad(true);

      const multiplier = await publicClient.readContract({
        address: OVCX_ORACLE,
        abi: BalancerOracleAbi,
        functionName: "multiplier",
      });
      const strikePriceRes = await publicClient.readContract({
        address: OVCX_ORACLE,
        abi: BalancerOracleAbi,
        functionName: "getPrice",
      });
      const strikePriceInUsd = (Number(strikePriceRes) / 1e18) * tokens[1][WETH].price;

      setWethPrice(tokens[1][WETH].price);
      setVCXPrice(tokens[1][VCX].price);
      setStrikePrice(strikePriceInUsd);
      setOVcxDiscount(multiplier);
    }
    if (!initialLoad && Object.keys(tokens).length > 0) setUpPrices();
  }, [initialLoad]);

  function handleMaxWeth() {
    const maxEth = formatEther(safeRound(wethBal?.value || ZERO, 18));

    setMaxPaymentAmount(maxEth);
    setAmount(getOPopAmount(Number(maxEth)));
  }

  function handleMaxOPop() {
    const maxOPop = formatEther(safeRound(oVcxBal?.value || ZERO, 18));

    setMaxPaymentAmount(getMaxPaymentAmount(Number(maxOPop)));
    setAmount(maxOPop);
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

  return (
    <div className="mb-8 text-start">
      <h2 className="text-start text-5xl">Exercise oVCX</h2>
      <p className="text-white font-semibold">
        Strike Price: $ {formatNumber(strikePrice)} | oVCX Price: ${" "}
        {formatNumber(vcxPrice - strikePrice)} | VCX Price: $ {formatNumber(vcxPrice)} | Discount:{" "}
        {((10_000 - oVcxDiscount) / 100).toFixed(2)} %
      </p>
      <div className="mt-8">
        <InputTokenWithError
          captionText={"Amount oVCX"}
          onSelectToken={() => { }}
          onMaxClick={handleMaxOPop}
          chainId={1}
          value={amount}
          onChange={handleOPopInput}
          allowInput={true}
          selectedToken={tokens[1][OptionTokenByChain[1]]}
          errorMessage={
            Number(amount) > Number(oVcxBal?.value) / 1e18
              ? "Insufficient Balance"
              : ""
          }
          tokenList={[]}
        />
        <div className="flex justify-center -mt-2 mb-4">
          <PlusIcon className="w-8 h-8 text-customGray500" />
        </div>

        <InputTokenWithError
          captionText={"Amount WETH"}
          onSelectToken={() => { }}
          onMaxClick={handleMaxWeth}
          chainId={1}
          value={maxPaymentAmount}
          onChange={handleEthInput}
          allowInput={true}
          selectedToken={tokens[1][WETH]
          }
          tokenList={[]}
          errorMessage={
            Number(maxPaymentAmount) > Number(wethBal?.value) / 1e18
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
            <p className="font-medium text-lg leading-none hidden md:block text-white group-hover:text-primaryYellow">
              VCX
            </p>
          </span>
        </div>
      </div>
    </div>
  );
}
