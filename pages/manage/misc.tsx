import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import SpinningLogo from "@/components/common/SpinningLogo";
import TabSelector from "@/components/common/TabSelector";
import InputNumber from "@/components/input/InputNumber";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import ActionSteps from "@/components/vault/ActionSteps";
import { handleAllowance } from "@/lib/approve";
import { tokensAtom } from "@/lib/atoms";
import bridgeToken, { DestinationIdByChain } from "@/lib/bridging/bridgeToken";
import { BalancerOracleAbi, LockboxAdapterByChain, OptionTokenAbi, OptionTokenByChain, OVCX_ORACLE, ROOT_GAUGE_FACTORY, ST_VCX, VCX, XVCXByChain } from "@/lib/constants";
import { transmitRewards } from "@/lib/gauges/interactions";
import { ActionStep, getSmartVaultActionSteps } from "@/lib/getActionSteps";
import { showLoadingToast } from "@/lib/toasts";
import { SimulationResponse, SmartVaultActionType, Token } from "@/lib/types";
import { handleCallResult, handleSwitchChain, validateInput } from "@/lib/utils/helpers";
import { fundReward } from "@/lib/vault/lockVault/interactions";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { encodeAbiParameters, getAddress } from "viem";
import { mainnet, optimism } from "viem/chains";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";

async function simulateCall({
  address,
  account,
  abi,
  args,
  functionName,
  publicClient,
}: any): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi,
      functionName,
      args: args,
    });
    return { request: request, success: true, error: null };
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage };
  }
}

//   setParams(uint16 multiplier_, uint56 secs_, uint56 ago_, uint128 minPrice_)
function SetOptionTokenOracleParams(): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 1 });
  const { data: walletClient } = useWalletClient();

  const [values, setValues] = useState<{
    multiplier: number;
    secs: number;
    ago: number;
    minPrice: number;
  }>({ multiplier: 0, secs: 0, ago: 0, minPrice: 0 });

  async function getValues() {
    if (!publicClient) return
    const res = await publicClient.multicall({
      contracts: [
        {
          address: OVCX_ORACLE,
          abi: BalancerOracleAbi,
          functionName: "multiplier",
        },
        {
          address: OVCX_ORACLE,
          abi: BalancerOracleAbi,
          functionName: "secs",
        },
        {
          address: OVCX_ORACLE,
          abi: BalancerOracleAbi,
          functionName: "ago",
        },
        {
          address: OVCX_ORACLE,
          abi: BalancerOracleAbi,
          functionName: "minPrice",
        },
      ],
      allowFailure: false,
    });
    setValues({
      multiplier: Number(res[0]),
      secs: Number(res[1]),
      ago: Number(res[2]),
      minPrice: Number(res[3]),
    });
  }

  useEffect(() => {
    if (values.multiplier === 0) getValues();
  }, [values, publicClient]);

  function handleChangeInput(
    value: string,
    key: "multiplier" | "secs" | "ago" | "minPrice"
  ) {
    const newValues = { ...values };
    newValues[key] = Number(value);
    setValues(newValues);
  }

  async function handleMainAction() {
    if (!walletClient || !account) return;

    showLoadingToast("Adjusting OptionToken-Oracle values...");

    return handleCallResult({
      successMessage: "Adjusted OptionToken-Oracle values!",
      simulationResponse: await simulateCall({
        account,
        address: OVCX_ORACLE,
        abi: BalancerOracleAbi,
        args: [values.multiplier, values.secs, values.ago, values.minPrice],
        functionName: "setParams",
        publicClient: publicClient,
      }),
      clients: {
        publicClient: publicClient!,
        walletClient,
      },
    });
  }

  return values.multiplier > 0 ? (
    <div className="border-b border-white pb-4 py-10 px-4 md:px-8">
      <h2 className="text-white text-xl">OptionToken-Oracle Values</h2>
      <div className="flex md:flex-row md:space-x-4 mt-4">
        <div>
          <p className="text-white text-start">Multiplier</p>
          <div className="border border-customGray500">
            <InputNumber
              value={values.multiplier}
              onChange={(e) =>
                handleChangeInput(e.currentTarget.value, "multiplier")
              }
            />
          </div>
        </div>
        <div>
          <p className="text-white text-start">Secs</p>
          <div className="border border-customGray500">
            <InputNumber
              value={values.secs}
              onChange={(e) => handleChangeInput(e.currentTarget.value, "secs")}
            />
          </div>
        </div>
        <div>
          <p className="text-white text-start">Ago</p>
          <div className="border border-customGray500">
            <InputNumber
              value={values.ago}
              onChange={(e) => handleChangeInput(e.currentTarget.value, "ago")}
            />
          </div>
        </div>
        <div>
          <p className="text-white text-start">Min Price</p>
          <div className="border border-customGray500">
            <InputNumber
              value={values.minPrice}
              onChange={(e) =>
                handleChangeInput(e.currentTarget.value, "minPrice")
              }
            />
          </div>
        </div>
      </div>
      <div className="w-40 mt-4">
        <MainActionButton
          label="Submit"
          handleClick={() => handleMainAction()}
          disabled={!account}
        />
      </div>
    </div>
  ) : (
    <SpinningLogo />
  );
}

export default function Misc(): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 1 });
  const { data: walletClient } = useWalletClient();
  const { openConnectModal } = useConnectModal();

  return (
    <NoSSR>
      {(account && walletClient) ?
        <>
          <section className="md:border-b border-customNeutral100 md:flex md:flex-row items-center justify-between py-10 px-4 md:px-8 md:gap-4">
            <div className="w-full md:w-max">
              <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-white md:text-3xl leading-none">
                Smart Vaults
              </h1>
              <p className="text-customGray100 md:text-white md:opacity-80">
                Automate your returns in single-asset deposit yield strategies.
              </p>
            </div>
          </section>
          <div className="">
            <SetOptionTokenOracleParams />
            <RewardBridger />
            <BridgeVCX />
            <StakingRewardFunding />
          </div>
        </>
        : <MainActionButton label="Connect Wallet" handleClick={openConnectModal} />
      }
    </NoSSR>
  );
}


function RewardBridger() {
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 1 });
  const { data: walletClient } = useWalletClient();

  const [inputValue, setInputValue] = useState<string>("")

  return <div className="border-b border-white pb-4 py-10 px-4 md:px-8">
    <h2 className="text-white text-xl">Bridge Gauge Rewards</h2>
    <div>
      <p className="text-white text-start">Gauges</p>
      <p className="text-customGray500">Enter the gauge addresses of L2 gauges with rewards seperated by comma. (address1,address2)</p>
      <div className="border border-customGray500">
        <InputNumber
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          type="text"
        />
      </div>
    </div>
    <div className="flex md:flex-row md:space-x-4 mt-4">
      <MainActionButton
        label="Transmit Rewards"
        handleClick={() =>
          transmitRewards({
            gauges: inputValue.split(",").map(addr => getAddress(addr)),
            account: account!,
            address: ROOT_GAUGE_FACTORY,
            clients: { publicClient: publicClient!, walletClient: walletClient! }
          })
        }
        disabled={!account}
      />
    </div>
  </div>
}


function BridgeVCX() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address: account, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const [tokens, setTokens] = useAtom(tokensAtom)

  const [inputToken, setInputToken] = useState<Token>()
  const [outputToken, setOutputToken] = useState<Token>()

  const [chainId, setChainId] = useState<number>(optimism.id)
  const [destChainId, setDestChainId] = useState<number>(mainnet.id)

  const [activeTab, setActiveTab] = useState<string>("OP -> ETH")
  const [inputAmount, setInputAmount] = useState<string>("0");
  const [stepCounter, setStepCounter] = useState<number>(0);
  const [steps, setSteps] = useState<ActionStep[]>(
    getSmartVaultActionSteps(SmartVaultActionType.Deposit)
  );

  useEffect(() => {
    if (Object.keys(tokens).length > 0 && Object.keys(tokens[10]).length > 0 && Object.keys(tokens[1]).length > 0) {
      setInputToken(tokens[10][XVCXByChain[10]])
      setOutputToken(tokens[1][VCX])
    }
  }, [account, tokens])

  function switchTab(newTab: string) {
    setStepCounter(0);
    setSteps(getSmartVaultActionSteps(SmartVaultActionType.Deposit))
    setInputAmount("0")

    switch (newTab) {
      case "OP -> ETH":
        setChainId(10)
        setDestChainId(1)
        setInputToken(tokens[10][XVCXByChain[10]])
        setOutputToken(tokens[1][VCX])
        break
      case "ETH -> OP":
        setChainId(1)
        setDestChainId(10)
        setInputToken(tokens[1][VCX])
        setOutputToken(tokens[10][XVCXByChain[10]])
        break
      case "ARB -> ETH":
        setChainId(42161)
        setDestChainId(1)
        setInputToken(tokens[42161][XVCXByChain[42161]])
        setOutputToken(tokens[1][VCX])
        break
      case "ETH -> ARB":
        setChainId(1)
        setDestChainId(42161)
        setInputToken(tokens[1][VCX])
        setOutputToken(tokens[42161][XVCXByChain[42161]])
        break
    }

    setActiveTab(newTab)
  }


  function handleChangeInput(e: any) {
    const value = e.currentTarget.value;
    setInputAmount(validateInput(value).isValid ? value : "0");
  }

  function handleMaxClick() {
    if (!inputToken) return
    handleChangeInput({ currentTarget: { value: inputToken.balance.formatted } });
  }

  async function handleMainAction() {
    let val = Number(inputAmount)
    if (val === 0 || !account || !walletClient || !inputToken) return;
    val = val * (10 ** inputToken.decimals)

    if (chain?.id !== Number(chainId)) {
      try {
        await switchChainAsync?.({ chainId });
      } catch (error) {
        return;
      }
    }

    console.log({ chainId, destChainId })

    const stepsCopy = [...steps];
    const currentStep = stepsCopy[stepCounter];
    currentStep.loading = true;
    setSteps(stepsCopy);

    let success = false;
    switch (stepCounter) {
      case 0:
        success = await handleAllowance({
          token: chainId === mainnet.id ? VCX : XVCXByChain[chainId],
          amount: val,
          account: account!,
          spender: LockboxAdapterByChain[chainId],
          clients: {
            publicClient: publicClient!,
            walletClient: walletClient!,
          },
        });
        break;
      case 1:
        success = await bridgeToken({
          destination: DestinationIdByChain[destChainId],
          to: chainId === mainnet.id ? account! : LockboxAdapterByChain[mainnet.id],
          asset: chainId === mainnet.id ? VCX : XVCXByChain[chainId],
          delegate: account!,
          amount: BigInt(
            Number(val).toLocaleString("fullwide", { useGrouping: false })
          ),
          slippage: 0,
          callData: chainId === mainnet.id ? "0x" : encodeAbiParameters([{ name: "recipient", type: "address" }], [account!]),
          account: account!,
          clients: { publicClient: publicClient!, walletClient: walletClient! },
          chainId
        });
        if (success) {
          await mutateTokenBalance({
            tokensToUpdate: [inputToken.address],
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

  return <div className="border-b border-white pb-4 py-10 px-4 md:px-8">
    <h2 className="text-white text-xl mb-2">Bridge VCX</h2>
    <div className="border-t border-gray-500 pt-4">
      <TabSelector
        className="mb-6"
        availableTabs={["OP -> ETH", "ETH -> OP", "ARB -> ETH", "ETH -> ARB"]}
        activeTab={activeTab}
        setActiveTab={switchTab}
      />
      {
        Object.keys(tokens).length > 0 &&
        <>
          <InputTokenWithError
            captionText={"Bridge Amount"}
            onSelectToken={() => { }}
            onMaxClick={handleMaxClick}
            chainId={chainId}
            value={inputAmount}
            onChange={handleChangeInput}
            selectedToken={inputToken}
            errorMessage={""}
            tokenList={[]}
            allowSelection={false}
            allowInput
          />
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-customGray500" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-customNeutral300 px-4">
                <ArrowDownIcon
                  className="h-10 w-10 p-2 text-customGray500 border border-customGray500 rounded-full cursor-pointer hover:text-white hover:border-white"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
          <InputTokenWithError
            captionText={"Output Amount"}
            onSelectToken={() => { }}
            onMaxClick={() => { }}
            chainId={destChainId}
            value={inputAmount}
            onChange={() => { }}
            selectedToken={outputToken}
            errorMessage={""}
            tokenList={[]}
            allowSelection={false}
            allowInput={false}
          />
          <div className="w-full flex justify-center my-6">
            <ActionSteps steps={steps} stepCounter={stepCounter} />
          </div>
          <div className="w-full bg-primaryYellow bg-opacity-30 border border-primaryYellow rounded-lg p-4">
            <p className="text-primaryYellow">
              Note that bridging is performed in batches. It might take up to 3 hours before you receive the tokens in your wallet.
            </p>
          </div>
          <div className="mt-6">
            <MainActionButton
              label="Bridge"
              handleClick={handleMainAction}
            />
          </div>
        </>
      }
    </div>
  </div>
}

function StakingRewardFunding() {
  const publicClient = usePublicClient({ chainId: 1 });
  const { data: walletClient } = useWalletClient();
  const { address: account, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const [tokens, setTokens] = useAtom(tokensAtom)

  const [vcxAmount, setVcxAmount] = useState<string>("0")
  const [ovcxAmount, setOvcxAmount] = useState<string>("0")

  function handleChangeInput(e: any, isVCX: boolean) {
    let value = e.currentTarget.value;
    value = validateInput(value).isValid ? value : "0"
    isVCX ? setVcxAmount(value) : setOvcxAmount(value);
  }

  function handleMaxClick(isVCX: boolean) {
    if (!tokens) return
    const inputToken = isVCX ? tokens[1][VCX] : tokens[1][OptionTokenByChain[1]]
    handleChangeInput({ currentTarget: { value: inputToken.balance.formatted } }, isVCX);
  }

  async function handleMainAction() {
    const vcxVal = Number(vcxAmount) * 1e18;
    const ovcxVal = Number(ovcxAmount) * 1e18;

    fundReward({
      amounts: [vcxVal, ovcxVal],
      account: account!,
      address: ST_VCX,
      chainId: 1,
      tokensToUpdate: [VCX, OptionTokenByChain[1]],
      tokensAtom: [tokens, setTokens],
      clients: {
        publicClient: publicClient!,
        walletClient: walletClient!
      },
    })
  }

  return Object.keys(tokens).length > 0 ?
    <div className="border-b border-white pb-4 py-10 px-4 md:px-8">
      <h2 className="text-white text-xl mb-2">Fund Staking Rewards</h2>
      <div>
        <InputTokenWithError
          captionText={"VCX Amount"}
          onSelectToken={() => { }}
          onMaxClick={() => handleMaxClick(true)}
          chainId={1}
          value={vcxAmount}
          onChange={(e) => handleChangeInput(e, true)}
          selectedToken={tokens[1][VCX]}
          errorMessage={""}
          tokenList={[]}
          allowSelection={false}
          allowInput
        />
        <InputTokenWithError
          captionText={"OVCX Amount"}
          onSelectToken={() => { }}
          onMaxClick={() => handleMaxClick(false)}
          chainId={1}
          value={ovcxAmount}
          onChange={(e) => handleChangeInput(e, false)}
          selectedToken={tokens[1][OptionTokenByChain[1]]}
          errorMessage={""}
          tokenList={[]}
          allowSelection={false}
          allowInput
        />
      </div>
      <div>
        {!account &&
          <MainActionButton
            label={"Connect Wallet"}
            handleClick={openConnectModal}
          />
        }
        {(account && chain?.id !== 1) &&
          <MainActionButton
            label="Switch Chain"
            handleClick={() => handleSwitchChain(1, switchChainAsync)}
          />
        }
        {(account && chain?.id === 1) &&
          <div className="space-y-4">
            <SecondaryActionButton
              label="Approve VCX"
              handleClick={() => handleAllowance({
                token: VCX,
                amount: Number(vcxAmount) * 1e18,
                account,
                spender: ST_VCX,
                clients: {
                  publicClient: publicClient!,
                  walletClient: walletClient!
                },
              })}
            />
            <SecondaryActionButton
              label="Approve oVCX"
              handleClick={() => handleAllowance({
                token: OptionTokenByChain[1],
                amount: Number(ovcxAmount) * 1e18,
                account,
                spender: ST_VCX,
                clients: {
                  publicClient: publicClient!,
                  walletClient: walletClient!
                },
              })}
            />
            <MainActionButton
              label="Fund rewards"
              handleClick={handleMainAction}
            />
          </div>
        }
      </div>
    </div>
    : <SpinningLogo />
}