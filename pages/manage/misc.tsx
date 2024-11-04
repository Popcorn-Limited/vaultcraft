import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import SpinningLogo from "@/components/common/SpinningLogo";
import InputNumber from "@/components/input/InputNumber";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { handleAllowance } from "@/lib/approve";
import { tokensAtom } from "@/lib/atoms";
import { BalancerOracleAbi, OptionTokenByChain, OVCX_ORACLE, ROOT_GAUGE_FACTORY, ST_VCX, VCX } from "@/lib/constants";
import { transmitRewards } from "@/lib/gauges/interactions";
import { showLoadingToast } from "@/lib/toasts";
import { SimulationResponse } from "@/lib/types";
import { handleCallResult, handleSwitchChain, validateInput } from "@/lib/utils/helpers";
import { fundReward } from "@/lib/vault/lockVault/interactions";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { getAddress } from "viem";
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