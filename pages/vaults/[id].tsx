import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { FeeConfiguration, ReserveData, Token, UserAccountData, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { Address, WalletClient, createPublicClient, extractChain, formatUnits, http, zeroAddress } from "viem";
import { VaultAbi, getVeAddresses } from "@/lib/constants";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { NumberFormatter, formatAndRoundNumber, formatNumber, formatToFixedDecimals, safeRound } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces, validateInput } from "@/lib/utils/helpers";
import MainActionButton from "@/components/button/MainActionButton";
import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards";
import { claimOPop } from "@/lib/optionToken/interactions";
import { llama } from "@/lib/resolver/price/resolver";
import VaultInputs from "@/components/vault/VaultInputs";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { ArrowRightIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { DEFAULT_ASSET, availableZapAssetAtom, zapAssetsAtom } from "@/lib/atoms";
import { getTokenOptions, isDefiPosition } from "@/lib/vault/utils";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import { KelpVaultInputs, getKelpVaultData, mutateKelpTokenBalance } from "@/components/vault/KelpVault";
import TabSelector from "@/components/common/TabSelector";
import { calcUserAccountData, fetchAaveData } from "@/lib/vault/aave/interactionts";
import Modal from "@/components/modal/Modal";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import TokenIcon from "@/components/common/TokenIcon";
import Title from "@/components/common/Title";
import { AavePoolAbi } from "@/lib/constants/abi/Aave";
import { EMPTY_USER_ACCOUNT_DATA, aaveAccountDataAtom, aaveReserveDataAtom } from "@/lib/atoms/lending";
import { useConnectModal } from "@rainbow-me/rainbowkit";

const { oVCX: OVCX, VCX } = getVeAddresses();


export default function Index() {
  const router = useRouter();
  const { query } = router;

  const { address: account } = useAccount();
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [yieldOptions] = useAtom(yieldOptionsAtom)

  const [vaults] = useAtom(vaultsAtom)
  const [vaultData, setVaultData] = useState<VaultData>()

  useEffect(() => {
    if (!vaultData && query && yieldOptions && vaults.length > 0) {
      if (query?.id === "0x7CEbA0cAeC8CbE74DB35b26D7705BA68Cb38D725") {
        getKelpVaultData(account || zeroAddress, publicClient, yieldOptions).then(res => {
          setVaultData(res.vaultData);
          setTokenOptions(res.tokenOptions)
        })
      } else {
        setVaultData(vaults.find(vault => vault.address === query?.id && vault.chainId === Number(query?.chainId)))
      }
    }
  }, [vaults, query, vaultData])

  const [zapAssets] = useAtom(zapAssetsAtom)
  const [availableZapAssets] = useAtom(availableZapAssetAtom)
  const [zapAvailable, setZapAvailable] = useState<boolean>(false)
  const [tokenOptions, setTokenOptions] = useState<Token[]>([])

  useEffect(() => {
    if (!!vaultData && Object.keys(availableZapAssets).length > 0 && vaultData.address !== "0x7CEbA0cAeC8CbE74DB35b26D7705BA68Cb38D725") {
      if (availableZapAssets[vaultData.chainId].includes(vaultData.asset.address)) {
        setZapAvailable(true)
        setTokenOptions(getTokenOptions(vaultData, zapAssets[vaultData.chainId]))
      } else {
        isDefiPosition({ address: vaultData.asset.address, chainId: vaultData.chainId }).then(isZapable => {
          if (isZapable) {
            setZapAvailable(true)
            setTokenOptions(getTokenOptions(vaultData, zapAssets[vaultData.chainId]))
          } else {
            setTokenOptions(getTokenOptions(vaultData))
          }
        })
      }
    }
  }, [availableZapAssets, vaultData])

  const [gaugeRewards, setGaugeRewards] = useState<GaugeRewards>()
  const { data: oBal } = useBalance({ chainId: 1, address: account, token: OVCX, watch: true })
  const [vcxPrice, setVcxPrice] = useState<number>(0)

  useEffect(() => {
    async function getRewardsData() {
      const rewards = await getGaugeRewards({
        gauges: vaults.filter(vault => vault.gauge && vault.chainId === 1).map(vault => vault.gauge?.address) as Address[],
        account: account as Address,
        publicClient
      })
      setGaugeRewards(rewards)
      const vcxPriceInUsd = await llama({ address: VCX, chainId: 1 })
      setVcxPrice(vcxPriceInUsd)
    }
    if (account) getRewardsData();
  }, [account])

  const [showLendModal, setShowLendModal] = useState(false)

  return <NoSSR>
    {
      vaultData ? (
        <>
          <LoanInterface visibilityState={[showLendModal, setShowLendModal]} vaultData={vaultData} />
          <div className="min-h-screen">
            <button
              className="border border-gray-500 rounded-lg flex flex-row items-center px-4 py-2 ml-4 md:ml-8 mt-10"
              type="button"
              onClick={() => router.push("/vaults")}
            >
              <div className="w-5 h-5">
                <LeftArrowIcon color="#FFF" />
              </div>
              <p className="text-white leading-0 mt-1 ml-2">Back to Vaults</p>
            </button>
            <section className="md:border-b border-[#353945] py-10 px-4 md:px-8">

              <div className="w-full mb-8">
                <AssetWithName vault={vaultData} size={3} />
              </div>

              <div className="w-full md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 mt-4 md:mt-0">
                <div className="flex flex-wrap md:flex-row md:items-center md:pr-10 gap-4 md:gap-10 md:w-fit">

                  <div className="w-[120px] md:w-max">
                    <p className="leading-6 text-base text-primaryDark md:text-primary">Your Wallet</p>
                    <div className="text-3xl font-bold whitespace-nowrap text-primary">
                      {`${formatAndRoundNumber(vaultData.asset.balance, vaultData.asset.decimals)}`}
                    </div>
                  </div>

                  <div className="w-[120px] md:w-max">
                    <p className="leading-6 text-base text-primaryDark md:text-primary">Deposits</p>
                    <div className="text-3xl font-bold whitespace-nowrap text-primary">
                      {`${formatAndRoundNumber(vaultData.vault.balance, vaultData.vault.decimals)}`}
                    </div>
                  </div>

                  <div className="w-[120px] md:w-max">
                    <p className="leading-6 text-base text-primaryDark md:text-primary">TVL</p>
                    <div className="text-3xl font-bold whitespace-nowrap text-primary">
                      $ {vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}
                    </div>
                  </div>

                  <div className="w-[120px] md:w-max">
                    <p className="w-max leading-6 text-base text-primaryDark md:text-primary">vAPY</p>
                    <div className="text-3xl font-bold whitespace-nowrap text-primary">
                      {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.apy))} %`}
                    </div>
                  </div>
                  {
                    vaultData.gaugeMinApy ? (
                      <div className="w-[120px] md:w-max">
                        <p className="w-max leading-6 text-base text-primaryDark md:text-primary">Min Boost</p>
                        <div className="text-3xl font-bold whitespace-nowrap text-primary">
                          {vaultData.gaugeMinApy.toFixed(2)} %
                        </div>
                      </div>
                    )
                      : <></>
                  }
                  {
                    vaultData.gaugeMaxApy ? (
                      <div className="w-[120px] md:w-max">
                        <p className="w-max leading-6 text-base text-primaryDark md:text-primary">Max Boost</p>
                        <div className="text-3xl font-bold whitespace-nowrap text-primary">
                          {vaultData.gaugeMaxApy.toFixed(2)} %
                        </div>
                      </div>
                    )
                      : <></>
                  }
                </div>

                <div className="flex flex-row items-center md:gap-6 md:w-fit md:pl-12">
                  <div className="flex gap-4 md:gap-10 w-fit">
                    <div className="w-[120px] md:w-max">
                      <p className="w-max leading-6 text-base text-primaryDark md:text-primary">My oVCX</p>
                      <div className="w-max text-3xl font-bold whitespace-nowrap text-primary">
                        {`$${oBal && vcxPrice ? NumberFormatter.format((Number(oBal?.value) / 1e18) * (vcxPrice * 0.25)) : "0"}`}
                      </div>
                    </div>

                    <div className="w-[120px] md:w-max">
                      <p className="w-max leading-6 text-base text-primaryDark md:text-primary">Claimable oVCX</p>
                      <div className="w-max text-3xl font-bold whitespace-nowrap text-primary">
                        {`$${gaugeRewards && vcxPrice ? NumberFormatter.format((Number(gaugeRewards?.total) / 1e18) * (vcxPrice * 0.25)) : "0"}`}
                      </div>
                    </div>
                  </div>

                  <div className="hidden align-bottom md:block md:mt-auto w-fit mb-2">
                    <MainActionButton
                      label="Claim oVCX"
                      handleClick={() =>
                        claimOPop({
                          gauges: gaugeRewards?.amounts?.filter(gauge => Number(gauge.amount) > 0).map(gauge => gauge.address) as Address[],
                          account: account as Address,
                          clients: { publicClient, walletClient: walletClient as WalletClient }
                        })}
                    />
                  </div>
                </div>
                <div className="md:hidden">
                  <MainActionButton
                    label="Claim oVCX"
                    handleClick={() =>
                      claimOPop({
                        gauges: gaugeRewards?.amounts?.filter(gauge => Number(gauge.amount) > 0).map(gauge => gauge.address) as Address[],
                        account: account as Address,
                        clients: { publicClient, walletClient: walletClient as WalletClient }
                      })}
                  />
                </div>
              </div>
            </section>

            <section className="w-full md:flex md:flex-row md:justify-between md:space-x-8 py-10 px-4 md:px-8">

              <div className="w-full md:w-1/3 space-y-4">
                <div className="bg-[#23262f] p-6 rounded-lg">
                  <div className="bg-[#141416] px-6 py-6 rounded-lg">
                    {vaultData.address === "0x7CEbA0cAeC8CbE74DB35b26D7705BA68Cb38D725" ?
                      <KelpVaultInputs
                        vaultData={vaultData}
                        tokenOptions={tokenOptions}
                        chainId={vaultData.chainId}
                        hideModal={() => router.reload()}
                        mutateTokenBalance={mutateKelpTokenBalance}
                        setVaultData={setVaultData}
                        setTokenOptions={setTokenOptions}
                      /> :
                      <VaultInputs
                        vaultData={vaultData}
                        tokenOptions={tokenOptions}
                        chainId={vaultData.chainId}
                        hideModal={() => router.reload()}
                        mutateTokenBalance={mutateTokenBalance}
                      />}
                  </div>
                </div>
                <div className="bg-[#23262f] p-6 rounded-lg">
                  <div className="bg-[#141416] px-6 py-6 rounded-lg">
                    <p className="text-white">Loan</p>
                    <p className="text-gray-500">Lorem Ipsum</p>
                    <MainActionButton
                      label="Open Loan Modal"
                      handleClick={() => setShowLendModal(true)}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 mt-8 md:mt-0 space-y-4">

                <div className="bg-[#23262f] p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold mb-8">Strategy</p>
                  <p className='text-white'>
                    {vaultData.metadata.optionalMetadata.protocol.description.split("** - ")[1]}
                  </p>

                  <div className="mt-8">

                  </div>

                  <div className="md:flex md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-8">

                    <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                      <p className="text-primary font-normal">Vault address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-primary">
                          {vaultData.address.slice(0, 6)}...{vaultData.address.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={vaultData.address} onCopy={() => showSuccessToast("Vault address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                    <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                      <p className="text-primary font-normal">Asset address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-primary">
                          {vaultData.asset.address.slice(0, 6)}...{vaultData.asset.address.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={vaultData.asset.address} onCopy={() => showSuccessToast("Asset address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                    {vaultData.gauge &&
                      <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                        <p className="text-primary font-normal">Gauge address:</p>
                        <div className="flex flex-row items-center justify-between">
                          <p className="font-bold text-primary">
                            {vaultData.gauge.address.slice(0, 6)}...{vaultData.gauge.address.slice(-4)}
                          </p>
                          <div className='w-6 h-6 group/gaugeAddress'>
                            <CopyToClipboard text={vaultData.gauge.address} onCopy={() => showSuccessToast("Gauge address copied!")}>
                              <Square2StackIcon className="text-white group-hover/gaugeAddress:text-[#DFFF1C]" />
                            </CopyToClipboard>
                          </div>
                        </div>
                      </div>
                    }

                  </div>
                </div>
              </div>

            </section>
          </div>
        </>
      )
        :
        <p className="text-white ml-4 md:ml-8">Loading...</p>
    }
  </NoSSR>
}

const LOAN_TABS = ["Supply", "Borrow", "Repay", "Withdraw"]

function LoanInterface({ visibilityState, vaultData }: { visibilityState: [boolean, Dispatch<SetStateAction<boolean>>], vaultData: VaultData }): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 10 })
  const { openConnectModal } = useConnectModal();

  const [reserveData] = useAtom(aaveReserveDataAtom)

  const [activeTab, setActiveTab] = useState<string>("Supply")
  const [tokenList, setTokenList] = useState<Token[]>([])
  const [supplyToken, setSupplyToken] = useState<Token | null>(null)
  const [borrowToken, setBorrowToken] = useState<Token | null>(null)
  const [inputToken, setInputToken] = useState<Token | null>(null)

  useEffect(() => {
    if (reserveData) {
      const sorted = reserveData.sort((a, b) => a.balance - b.balance)
      setTokenList(sorted.map(e => e.asset))

      const _supplyToken = sorted[0].asset.address === vaultData.asset.address ? reserveData[1].asset : reserveData[0].asset
      setSupplyToken(_supplyToken)
      setInputToken(_supplyToken)
      setBorrowToken(!!reserveData.find(e => e.asset.address === vaultData.asset.address) ? vaultData.asset : reserveData[0].asset)
    }
  }, [reserveData])

  function changeTab(newTab: string) {
    setActiveTab(newTab);
    setInputAmount("0");

    const assetBorrowable = !!reserveData.find(e => e.asset.address === vaultData.asset.address);
    let sorted: ReserveData[]
    let _inputToken: Token

    switch (newTab) {
      case "Supply":
        sorted = reserveData.filter(e => e.asset.address !== vaultData.asset.address).sort((a, b) => b.balance - a.balance)
        setTokenList(sorted.map(e => e.asset))

        _inputToken = sorted[0].asset
        setSupplyToken(_inputToken)
        setInputToken(_inputToken)
        return;
      case "Borrow":
        sorted = reserveData.sort((a, b) => b.borrowRate - a.borrowRate)
        setTokenList(sorted.map(e => e.asset))

        _inputToken = assetBorrowable ? vaultData.asset : sorted[0].asset
        setBorrowToken(_inputToken)
        setInputToken(_inputToken)
        return;
      case "Repay":
        sorted = reserveData.filter(e => e.borrowAmount > 0).sort((a, b) => b.borrowAmount - a.borrowAmount)
        setTokenList(sorted.length === 0 ? [] : sorted.map(e => e.asset))

        setInputToken(sorted.length === 0 ? null : sorted[0].asset)
        return;
      case "Withdraw":
        sorted = reserveData.filter(e => e.borrowAmount === 0).sort((a, b) => b.balance - a.balance)
        setTokenList(!account || sorted.length === 0 ? [] : sorted.map(e => e.asset))

        setInputToken(!account || sorted.length === 0 ? null : sorted[0].asset)
        return;
      default:
        return;
    }
  }

  function handleTokenSelect(input: Token) {
    switch (activeTab) {
      case "Supply":
        setSupplyToken(input)
        setInputToken(input)
        return;
      case "Borrow":
        setBorrowToken(input)
        setInputToken(input)
        return;
      case "Repay":
        setInputToken(input)
        return;
      case "Withdraw":
        setInputToken(input)
        return;
      default:
        return;
    }
  }

  const [inputAmount, setInputAmount] = useState<string>("0");

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value
    setInputAmount(validateInput(value).isValid ? value : "0");
  };

  function handleMaxClick() {
    if (!inputToken) return
    const stringBal = inputToken.balance.toLocaleString("fullwide", { useGrouping: false })
    const rounded = safeRound(BigInt(stringBal), inputToken.decimals)
    const formatted = formatUnits(rounded, inputToken.decimals)
    handleChangeInput({ currentTarget: { value: formatted } })
  }

  return <>
    <Modal visibility={visibilityState} title={<AssetWithName vault={vaultData} />} >
      <div className="flex flex-row space-x-8">
        <div className="w-1/3">
          <TabSelector
            className="mb-6"
            availableTabs={LOAN_TABS}
            activeTab={activeTab}
            setActiveTab={changeTab}
          />
          {(account && inputToken) ?
            <>
              <InputTokenWithError
                captionText={`${activeTab} Amount`}
                onSelectToken={handleTokenSelect}
                onMaxClick={handleMaxClick}
                chainId={vaultData.chainId}
                value={inputAmount}
                onChange={handleChangeInput}
                selectedToken={inputToken}
                errorMessage={""}
                tokenList={tokenList}
                allowSelection
                allowInput
              />
              <div className="mt-8">
                <MainActionButton
                  label="Open Loan Modal"
                  handleClick={() => { }}
                />
              </div>
            </>
            : <div>
              <MainActionButton
                label="Connect Wallet"
                handleClick={openConnectModal}
              />
            </div>
          }
        </div>
        <div className="w-2/3">
          {(!!reserveData && !!supplyToken && !!borrowToken) &&
            <AaveUserAccountData
              supplyToken={supplyToken}
              borrowToken={borrowToken}
              inputToken={inputToken || DEFAULT_ASSET}
              inputAmount={Number(inputAmount)}
              activeTab={activeTab}
            />
          }
        </div>
      </div>
    </Modal>
  </>
}

function getHealthFactorColor(healthFactor: number): string {
  if (!healthFactor) return "text-white"
  if (healthFactor === 0) {
    return "text-white"
  } else if (healthFactor > 3) {
    return "text-green-500"
  } else if (healthFactor > 1.3) {
    return "text-yellow-500"
  } else {
    return "text-red-500"
  }
}

export function AaveUserAccountData({ supplyToken, borrowToken, inputToken, inputAmount, activeTab }
  : { supplyToken: Token, borrowToken: Token, inputToken: Token, inputAmount: number, activeTab: string }): JSX.Element {
  const [reserveData] = useAtom(aaveReserveDataAtom)
  const [userAccountData] = useAtom(aaveAccountDataAtom)

  const [supplyReserve, setSupplyReserve] = useState<ReserveData>()
  const [borrowReserve, setBorrowReserve] = useState<ReserveData>()

  useEffect(() => {
    if (supplyToken && reserveData) {
      setSupplyReserve(reserveData.find(e => e.asset.address === supplyToken.address))
    }
  }, [supplyToken, reserveData])

  useEffect(() => {
    if (borrowToken && reserveData) {
      setBorrowReserve(reserveData.find(e => e.asset.address === borrowToken.address))
    }
  }, [borrowToken, reserveData])

  const [newUserAccountData, setNewUserAccountData] = useState<UserAccountData>(EMPTY_USER_ACCOUNT_DATA)

  useEffect(() => {
    if (inputToken.symbol === "none") return
    const newReserveData = [...reserveData]

    switch (activeTab) {
      case "Supply":
        newReserveData[reserveData.findIndex(e => e.asset.address === inputToken.address)].supplyAmount += inputAmount

        setNewUserAccountData(calcUserAccountData(newReserveData, userAccountData.ltv))
        return;
      case "Borrow":
        newReserveData[reserveData.findIndex(e => e.asset.address === inputToken.address)].borrowAmount += inputAmount

        setNewUserAccountData(calcUserAccountData(newReserveData, userAccountData.ltv))
        return;
      case "Repay":
        newReserveData[reserveData.findIndex(e => e.asset.address === inputToken.address)].borrowAmount -= inputAmount

        setNewUserAccountData(calcUserAccountData(newReserveData, userAccountData.ltv))
        return;
      case "Withdraw":
        newReserveData[reserveData.findIndex(e => e.asset.address === inputToken.address)].supplyAmount -= inputAmount

        setNewUserAccountData(calcUserAccountData(newReserveData, userAccountData.ltv))
        return;
      default:
        return;
    }
  }, [inputAmount, activeTab])

  console.log(userAccountData)

  return (supplyReserve && borrowReserve) ? (
    <>
      <div className="w-full space-y-4">
        <div className="border border-[#353945] rounded-lg p-4">
          <div className="w-full flex flex-row justify-between">

            <div className="w-1/3">
              <p className="text-start text-primary font-normal md:text-[14px]">Health Factor</p>
              <span className="flex flex-row items-center space-x-1">
                <Title
                  as="p"
                  level={2}
                  fontWeight="font-normal"
                  className={getHealthFactorColor(userAccountData.healthFactor)}
                >
                  {formatToFixedDecimals(userAccountData.healthFactor || 0, 2)}
                </Title>
                {inputAmount > 0 &&
                  <>
                    <ArrowRightIcon className="w-4 h-3 text-white" />
                    <Title
                      as="p"
                      level={2}
                      fontWeight="font-normal"
                      className={getHealthFactorColor(newUserAccountData.healthFactor)}
                    >
                      {formatToFixedDecimals(newUserAccountData.healthFactor || 0, 2)}
                    </Title>
                  </>}
              </span>
            </div>

            <div className="w-1/3">
              <p className="text-start text-primary font-normal md:text-[14px]">Lending Networth</p>
              <span className="flex flex-row items-center space-x-1">
                <Title as="p" level={2} fontWeight="font-normal" className="text-primary">
                  $ {formatNumber(userAccountData.netValue || 0)}
                </Title>
                {inputAmount > 0 &&
                  <>
                    <ArrowRightIcon className="w-4 h-3 text-white" />
                    <Title as="p" level={2} fontWeight="font-normal" className="text-primary">
                      $ {formatNumber(newUserAccountData.netValue || 0)}
                    </Title>
                  </>
                }
              </span>
            </div>

            <div className="w-1/3">
              <p className="text-start text-primary font-normal md:text-[14px]">Net Apy</p>
              <span className="flex flex-row items-center space-x-1">
                <Title as="p" level={2} fontWeight="font-normal" className="text-primary">
                  {formatToFixedDecimals(userAccountData.netRate || 0, 2)} %
                </Title>
                {inputAmount > 0 &&
                  <>
                    <ArrowRightIcon className="w-4 h-3 text-white" />
                    <Title as="p" level={2} fontWeight="font-normal" className="text-primary">
                      {formatToFixedDecimals(newUserAccountData.netRate || 0, 2)} %
                    </Title>
                  </>
                }
              </span>
            </div>
          </div>
        </div>

        <div className="border border-[#353945] rounded-lg p-4">
          <div className="w-full flex flex-row justify-between">

            <div className="w-1/3">
              <p className="text-start text-primary font-normal md:text-[14px]">Lending Apy</p>
              <span className="flex flex-row items-center space-x-2">
                <TokenIcon token={supplyToken} icon={supplyToken.logoURI} chainId={10} imageSize={"w-6 h-6 mb-0.5"} />
                <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                  {formatToFixedDecimals(supplyReserve.supplyRate || 0, 2)} %
                </Title>
              </span>
            </div>

            <div className="w-1/3">
              <p className="text-start text-primary font-normal md:text-[14px]">Borrow Apy</p>
              <span className="flex flex-row items-center space-x-2">
                <TokenIcon token={borrowToken} icon={borrowToken.logoURI} chainId={10} imageSize={"w-6 h-6 mb-0.5"} />
                <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                  -{formatToFixedDecimals(borrowReserve.borrowRate || 0, 2)} %
                </Title>
              </span>
            </div>

            <div className="w-1/3">

            </div>

          </div>

          <div className="w-full flex flex-row justify-between mt-4">

            <div className="text-start w-1/3">
              <p className="font-normal text-primary md:text-[14px]">Max LTV</p>
              <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
                {supplyReserve.ltv.toFixed(2)} %
              </Title>
            </div>

            <div className="text-start w-1/3">
              <p className="font-normal text-primary md:text-[14px]">Liquidation Threshold</p>
              <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
                {supplyReserve.liquidationThreshold.toFixed(2)} %
              </Title>
            </div>

            <div className="text-start w-1/3">
              <p className="font-normal text-primary md:text-[14px]">Liquidation Penalty</p>
              <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
                {supplyReserve.liquidationPenalty.toFixed(2)} %
              </Title>
            </div>

          </div>
        </div>
      </div>
    </>
  ) : <div className="w-full space-y-4">
    <p className="text-white">Data loading...</p>
  </div>
}