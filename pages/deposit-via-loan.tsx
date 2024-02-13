import MainActionButton from "@/components/button/MainActionButton";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import ActionSteps from "@/components/vault/ActionSteps";
import { masaAtom } from "@/lib/atoms/sdk";
import { ActionStep, getDepositVaultActionSteps } from "@/lib/getActionSteps";
import { DepositVaultActionType, ReserveData, Token, UserAccountData, VaultData } from "@/lib/types";
import { formatToFixedDecimals, safeRound } from "@/lib/utils/formatBigNumber";
import { validateInput } from "@/lib/utils/helpers";
import handleVaultInteraction from "@/lib/vault/aave/handleVaultInteraction";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Address, formatEther, formatUnits, getAddress, isAddress, maxUint256 } from "viem";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import ProtocolIcon from "@/components/common/ProtocolIcon";
import { fetchReserveData, fetchTokens, fetchUserAccountData } from "@/lib/vault/aave/interactionts";
import Title from "@/components/common/Title";

const ACTIVE_TABS = ["Supply", "Borrow", "Deposit"];

const DAI: Token = {
  address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", //OPTIMISM
  name: "DAI Stablecoin",
  symbol: "DAI",
  decimals: 18,
  logoURI: "https://etherscan.io/token/images/MCDDai_32.png",
  balance: 0,
  price: 1
}


const USDC: Token = {
  address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", //OPTIMISM
  name: "USD Coin",
  symbol: "USDC",
  decimals: 6,
  logoURI: "https://etherscan.io/token/images/centre-usdc_28.png",
  balance: 0,
  price: 1
}

const USDT: Token = {
  address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", //OPTIMISM
  name: "Tether",
  symbol: "USDT",
  decimals: 6,
  logoURI: "https://etherscan.io/token/images/tethernew_32.png",
  balance: 0,
  price: 1
}

const BAL: Token = {
  address: "0xFE8B128bA8C78aabC59d4c64cEE7fF28e9379921", //OPTIMISM
  name: "Balancer",
  symbol: "BAL",
  decimals: 18,
  logoURI: "https://etherscan.io/token/images/Balancer_32.png",
  balance: 0,
  price: 1
}

const Vault: Token = {
  address: "0x5372c5AF5f078f2d4B5dbBE4377b2f0225f2863A",
  name: "Popcorn USD Coin Vault (pop-USDC)",
  symbol: "pop-USDC",
  decimals: 15,
  logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
  balance: 0,
  price: 1
}


export default function DepositViaLoan() {
  const { query } = useRouter()
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 10 })
  const { data: walletClient } = useWalletClient()
  const { openConnectModal } = useConnectModal();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const [masaSdk,] = useAtom(masaAtom);

  const [inputTokens, setInputTokens] = useState<{
    dai: Token, usdc: Token, usdt: Token, bal: Token
  }>({ dai: DAI, usdc: USDC, usdt: BAL, bal: BAL })
  const [outputTokens, setOutputTokens] = useState<{
    dai: Token, usdc: Token, usdt: Token, bal: Token
  }>({ dai: DAI, usdc: USDC, usdt: BAL, bal: BAL })

  //TODO: remove initial state
  const [vaultData, setVaultData] = useState<VaultData>({
    address: Vault.address,
    apy: 0,
    asset: Vault,
    assetPrice: 0,
    assetsPerShare: 0,
    chainId: 0,
    depositLimit: 0,
    fees: { deposit: 0, withdrawal: 0, management: 0, performance: 0 },
    gauge: { address: "0x", name: "", symbol: "", decimals: 0, logoURI: "", balance: 0, price: 0 },
    gaugeMaxApy: 0,
    gaugeMinApy: 0,
    metadata: {
      creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
      feeRecipient: "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
      cid: "",
      optionalMetadata: {
        protocol: { name: "KelpDao", description: "" },
        token: { name: "", description: "", },
        strategy: { name: "", description: "" },
      },
    },
    pricePerShare: 0,
    totalApy: 0,
    totalAssets: 0,
    totalSupply: 0,
    tvl: 0,
    vault: Vault
  })

  useEffect(() => {
    if (account) {
      console.log("chain id:", chain?.id)
      fetchTokens(account, { DAI, USDT, USDC, BAL }, publicClient).then(tokens => {
        setInputTokens(tokens)
        setVaultData({
          assetPrice: 0, gauge: undefined, gaugeMaxApy: 0, gaugeMinApy: 0,
          address: Vault.address,
          vault: Vault, //todo: update this with aave data. check how this is used in VaultStat
          asset: tokens.usdc, //todo: update this with aave data. change VaultStat to AaveVaultStat
          totalAssets: 1,
          totalSupply: 1,
          assetsPerShare: 1,
          pricePerShare: 1,
          tvl: 1,
          fees: {
            deposit: 0,
            withdrawal: 0,
            performance: 0,
            management: 0
          },
          depositLimit: Number(maxUint256),
          metadata: {
            creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
            feeRecipient: "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
            cid: "",
            optionalMetadata: {
              protocol: { name: "Aave Deposit To Loan", description: "" },
              token: { name: "", description: "", },
              strategy: { name: "", description: "" },
            },
          },
          chainId: 1,
          apy: 0,
          totalApy: 0
        })
      })

      fetchUserAccountData(account, publicClient).then((userAccountData) => {
        setUserAccountData(userAccountData)
      })
    }
  }, [account])

  const [inputToken, setInputToken] = useState<Token>(inputTokens.dai)
  const [outputToken, setOutputToken] = useState<Token>()

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>([])
  const [action, setAction] = useState<DepositVaultActionType>(DepositVaultActionType.Supply)
  const [inputBalance, setInputBalance] = useState<string>("0");
  const [isDeposit, setIsDeposit] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>(ACTIVE_TABS[0]);
  const [reserveData, setReserveData] = useState<ReserveData>();

  const [userAccountData, setUserAccountData] = useState<UserAccountData>({
    availableBorrowsBase: 0,
    currentLiquidationThreshold: 0,
    healthFactor: 0,
    ltv: 0,
    totalCollateralBase: 0,
    totalDebtBase: 0
  })

  useEffect(() => {
    setInputToken(inputTokens.dai)
    setOutputToken(Vault)
    setSteps(getDepositVaultActionSteps(action))
    fetchReserveData(inputToken.address, publicClient).then(
      res => setReserveData(res)
    )
    //setInterestRate()
  }, [inputTokens])

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value
    setInputBalance(validateInput(value).isValid ? value : "0");
  }

  function handleMaxClick() {
    if (!inputToken) return
    const stringBal = inputToken.balance.toLocaleString("fullwide", { useGrouping: false })
    const rounded = safeRound(BigInt(stringBal), inputToken.decimals)
    const formatted = formatUnits(rounded, inputToken.decimals)
    handleChangeInput({ currentTarget: { value: formatted } })
  }

  function handleActiveTabSelect(activeTab: string) {
    switch (activeTab) {
      case "Supply":
        setStepCounter(0)
        setActiveTab(activeTab);
        setAction(DepositVaultActionType.Supply)
        setSteps(getDepositVaultActionSteps(DepositVaultActionType.Supply))
        return;
      case "Borrow":
        setStepCounter(1)
        setActiveTab(activeTab);
        setAction(DepositVaultActionType.Borrow)
        return;
      case "Deposit":
        setStepCounter(2)
        setActiveTab(activeTab);
        setAction(DepositVaultActionType.Deposit)
        return;
      default: return;
    }

  }

  function handleTokenSelect(input: Token, output: Token): void {
    setInputToken(input);
    setOutputToken(output)
    fetchReserveData(inputToken.address, publicClient).then(
      res => setReserveData(res)
    )
  }

  async function handleMainAction() {
    const val = Number(inputBalance)
    if (val === 0 || !inputToken || !outputToken || !account || !walletClient || !vaultData) return;

    if (chain?.id !== Number(10)) {
      try {
        await switchNetworkAsync?.(Number(10));
      } catch (error) {
        return
      }
    }

    let stepsCopy = [...steps]
    const currentStep = stepsCopy[stepCounter]
    currentStep.loading = true
    setSteps(stepsCopy)

    const vaultInteraction = await handleVaultInteraction({
      ethX: inputToken,
      action,
      stepCounter,
      chainId: chain?.id || 1,
      amount: (val * (10 ** inputToken.decimals)),
      inputToken,
      outputToken,
      vaultData: vaultData,
      account,
      slippage: 100,
      tradeTimeout: 60,
      clients: { publicClient, walletClient },
      fireEvent: masaSdk?.fireEvent,
      referral: !!query?.ref && isAddress(query.ref as string) ? getAddress(query.ref as string) : undefined
    })
    const success = await vaultInteraction()

    currentStep.loading = false
    currentStep.success = success;
    currentStep.error = !success;

    let newStepCounter = stepCounter + 1
    if (stepCounter === stepsCopy.length) {
      newStepCounter = 0;
      stepsCopy = [...getDepositVaultActionSteps(action)]
    }

    setSteps(stepsCopy)
    setStepCounter(newStepCounter)
    setActiveTab(ACTIVE_TABS[newStepCounter])
    setAction(newStepCounter)
  }

  return (

    <>
      <div className="w-full pt-6 px-6 md:pt-0 border-t border-[#353945] md:border-none md:mt-10">
        <h1
          className="text-[32px] leading-none md:text-center md:text-[56px] font-normal m-0 mb-2 md:mb-6 leading-0 text-primary">
          Deposit Via Loan
        </h1>
        <p className="leading-none md:text-4 text-left md:text-center text-xl text-primary">
          Take a loan from Aave and deposit your loaned asset into a vault
        </p>
      </div>

      <div className="px-6 md:px-8 py-10 border-t border-b border-[#353945] mt-6 md:mt-10 w-full">

        <div
          className="rounded-lg w-full md:w-1/3 md:min-w-[870px] bg-[#23262F] md:ml-auto md:mr-auto md:p-8 px-8 pt-6 pb-5 md:pl-11 border border-[#353945] [&_summary::-webkit-details-marker]:hidden">

          <div className="flex flex-row justify-between font-medium md:items-center mb-8">
            <ProtocolIcon
              protocolName={"Aave"}
              tooltip={{
                id: Vault.address,
                content: <p>{"lend from aave"}</p>
              }}
            />
          </div>

          <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">
            <AaveUserAccountData userAccountData={userAccountData} reserveData={reserveData} />
          </div>

          <TabSelector
            className="mb-6"
            availableTabs={["Supply", "Borrow", "Deposit"]}
            activeTab={activeTab}
            setActiveTab={handleActiveTabSelect}
          />

          <InputTokenWithError
            captionText={`${activeTab} Amount`}
            onSelectToken={option => handleTokenSelect(option, Vault)} //todo: check that this is the right token assignment
            onMaxClick={handleMaxClick}
            chainId={chain?.id}
            value={inputBalance}
            onChange={handleChangeInput}
            selectedToken={inputToken}
            errorMessage={""}
            tokenList={[inputTokens.dai, inputTokens.usdc, inputTokens.usdt, inputTokens.bal]}
            allowSelection={isDeposit}
            allowInput
          />

          {activeTab === "Deposit" && (
            <div className="relative flex justify-center my-6">
              <ArrowDownIcon
                className="h-10 w-10 p-2 text-[#9CA3AF] border border-[#4D525C] rounded-full cursor-pointer hover:text-primary hover:border-primary"
                aria-hidden="true"
                onClick={() => { }}
              />
            </div>
          )}

          {activeTab === "Deposit" && (
            <InputTokenWithError
              captionText={"Output Amount"}
              onSelectToken={option => handleTokenSelect(option, Vault)}  //todo: check that this is the right token assignment
              onMaxClick={() => {
              }}
              chainId={chain?.id}
              value={inputBalance}
              onChange={() => {
              }}
              selectedToken={outputToken}
              errorMessage={""}
              tokenList={[Vault]}
              allowSelection={!isDeposit}
              allowInput={false}
            />
          )}

          <div className="w-full flex justify-center my-6">
            <ActionSteps steps={steps} stepCounter={stepCounter} />
          </div>

          <div className="">
            {account && steps.length > 0 ?
              <MainActionButton label={steps[stepCounter]?.label} handleClick={handleMainAction}
                disabled={inputBalance === "0" || !steps[stepCounter] || steps[stepCounter].loading} />
              : < MainActionButton label={"Connect Wallet"} handleClick={openConnectModal} />
            }
          </div>
        </div>
      </div>
    </>
  );
}


export function AaveUserAccountData({ supplyToken, borrowToken }: { supplyToken: Token, borrowToken: Token }): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 10 })

  const [userAccountData, setUserAccountData] = useState<UserAccountData>({
    availableBorrowsBase: 0,
    currentLiquidationThreshold: 0,
    healthFactor: 0,
    ltv: 0,
    totalCollateralBase: 0,
    totalDebtBase: 0
  })

  useEffect(() => {
    if (account) fetchUserAccountData(account, publicClient).then((userAccountData) => {
      setUserAccountData(userAccountData)
    })
  }, [account])

  const [supplyData, setSupplyData] = useState<ReserveData>();
  const [borrowData, setBorrowData] = useState<ReserveData>();

  useEffect(() => {
    if (supplyToken) {
      fetchReserveData(supplyToken.address, publicClient).then(
        res => setSupplyData(res)
      )
    }
    if (borrowToken) {
      fetchReserveData(borrowToken.address, publicClient).then(
        res => setBorrowData(res)
      )
    }
  }, [supplyToken, borrowToken])


  return (
    <>
      <div className="w-full flex justify-between gap-8 md:gap-4">
        <div className="w-full mt-6 md:mt-0">
          <p className="text-primary font-normal md:text-[14px]">Debt Balance</p>
          <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {(userAccountData.totalDebtBase / 1e8).toFixed(2)} USD
            </Title>
          </p>
        </div>

        <div className="w-full mt-6 md:mt-0">
          <p className="text-primary font-normal md:text-[14px]">Max LTV</p>
          <div className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {(userAccountData.ltv / 10000).toFixed(2)}
            </Title>
          </div>
        </div>

        <div className="w-full mt-6 md:mt-0">
          <p className="leading-6 text-primary md:text-[14px]">Liquidation threshold</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            {(userAccountData.currentLiquidationThreshold / 10000).toFixed(2)}
          </Title>
        </div>
      </div>

      <div className="w-full flex justify-between gap-8 md:gap-4">
        <div className="w-full mt-6 md:mt-0">
          <p className="font-normal text-primary md:text-[14px]">Health Factor</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            {Number(formatEther(BigInt(userAccountData.healthFactor))).toFixed(2)}
          </Title>
        </div>

        <div className="w-full mt-6 md:mt-0">
          <p className="font-normal text-primary md:text-[14px]">Total Collateral</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            {(userAccountData.totalCollateralBase / 1e8).toFixed(2)} USD
          </Title>
        </div>

        <div className="w-full mt-6 md:mt-0">
          <p className="font-normal text-primary md:text-[14px]">Available Borrow</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            {(userAccountData.availableBorrowsBase / 1e8).toFixed(2)} USD
          </Title>
        </div>
      </div>

      {/* <div className="w-full flex justify-between gap-8 md:gap-4">
        <div className="w-full mt-6 md:mt-0">
          <p className="font-normal text-primary md:text-[14px]">Borrow Interest Rate</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            {formatToFixedDecimals(interestRate || 0, 2)} %
          </Title>
        </div>
      </div> */}
      <div className="w-full flex justify-between gap-8 md:gap-4"></div>
      <div className="w-full flex justify-between gap-8 md:gap-4"></div>
    </>
  )
}
