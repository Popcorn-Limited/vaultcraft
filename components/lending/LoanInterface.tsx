import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { FeeConfiguration, ReserveData, Token, UserAccountData, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { useAccount, useBalance, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { Address, WalletClient, createPublicClient, extractChain, formatUnits, getAddress, http, zeroAddress } from "viem";
import { NumberFormatter, formatAndRoundNumber, formatNumber, formatToFixedDecimals, safeRound } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces, validateInput } from "@/lib/utils/helpers";
import MainActionButton from "@/components/button/MainActionButton";
import { ArrowRightIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { DEFAULT_ASSET, availableZapAssetAtom, zapAssetsAtom } from "@/lib/atoms";
import TabSelector from "@/components/common/TabSelector";
import Modal from "@/components/modal/Modal";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import TokenIcon from "@/components/common/TokenIcon";
import Title from "@/components/common/Title";
import { EMPTY_USER_ACCOUNT_DATA, aaveAccountDataAtom, aaveReserveDataAtom } from "@/lib/atoms/lending";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ActionStep, getAaveActionSteps } from "@/lib/getActionSteps";
import handleAaveInteraction, { AaveActionType } from "@/lib/external/aave/handleAaveInteractions";
import { calcUserAccountData, fetchAaveData } from "@/lib/external/aave/interactions";
import { ERC20Abi } from "@/lib/constants";

const LOAN_TABS = ["Supply", "Borrow", "Repay", "Withdraw"]

export default function LoanInterface({ visibilityState, vaultData }: { visibilityState: [boolean, Dispatch<SetStateAction<boolean>>], vaultData: VaultData }): JSX.Element {
  const [visible, setVisible] = visibilityState

  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const [reserveData, setAaveReserveData] = useAtom(aaveReserveDataAtom)
  const [aaveAccountData, setAaveAccountData] = useAtom(aaveAccountDataAtom)
  const [zapAssets, setZapAssets] = useAtom(zapAssetsAtom)
  const [vaults, setVaults] = useAtom(vaultsAtom)

  const [activeTab, setActiveTab] = useState<string>("Supply")

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>(getAaveActionSteps(AaveActionType.Supply))
  const [action, setAction] = useState<AaveActionType>(AaveActionType.Supply)

  const [tokenList, setTokenList] = useState<Token[]>([])
  const [supplyToken, setSupplyToken] = useState<Token | null>(null)
  const [borrowToken, setBorrowToken] = useState<Token | null>(null)
  const [inputToken, setInputToken] = useState<Token | null>(null)

  useEffect(() => {
    if (reserveData) {
      const sorted = reserveData[vaultData.chainId].sort((a, b) => a.balance - b.balance)
      setTokenList(sorted.map(e => e.asset))

      const _supplyToken = sorted[0].asset.address === vaultData.asset.address ? reserveData[vaultData.chainId][1].asset : reserveData[vaultData.chainId][0].asset
      setSupplyToken(_supplyToken)
      setInputToken(_supplyToken)
      setBorrowToken(!!reserveData[vaultData.chainId].find(e => e.asset.address === vaultData.asset.address) ? vaultData.asset : reserveData[vaultData.chainId][0].asset)
    }
  }, [reserveData])

  function changeTab(newTab: string) {
    setActiveTab(newTab);
    setInputAmount("0");
    setStepCounter(0);

    const assetBorrowable = !!reserveData[vaultData.chainId].find(e => e.asset.address === vaultData.asset.address);
    let sorted: ReserveData[]
    let _inputToken: Token

    switch (newTab) {
      case "Supply":
        sorted = reserveData[vaultData.chainId].filter(e => e.asset.address !== vaultData.asset.address).sort((a, b) => b.balance - a.balance)
        setTokenList(sorted.map(e => e.asset))

        _inputToken = sorted[0].asset
        setSupplyToken(_inputToken)
        setInputToken(_inputToken)
        setAction(AaveActionType.Supply)
        setSteps(getAaveActionSteps(AaveActionType.Supply))
        return;
      case "Borrow":
        sorted = reserveData[vaultData.chainId].sort((a, b) => b.borrowRate - a.borrowRate)
        setTokenList(sorted.map(e => e.asset))

        _inputToken = assetBorrowable ? vaultData.asset : sorted[0].asset
        setBorrowToken(_inputToken)
        setInputToken(_inputToken)
        setAction(AaveActionType.Borrow)
        setSteps(getAaveActionSteps(AaveActionType.Borrow))
        return;
      case "Repay":
        sorted = reserveData[vaultData.chainId].filter(e => e.borrowAmount > 0).sort((a, b) => b.borrowAmount - a.borrowAmount)
        setTokenList(sorted.length === 0 ? [] : sorted.map(e => e.asset))

        setInputToken(sorted.length === 0 ? null : sorted[0].asset)
        setAction(AaveActionType.Repay)
        setSteps(getAaveActionSteps(AaveActionType.Repay))
        return;
      case "Withdraw":
        sorted = reserveData[vaultData.chainId].filter(e => e.borrowAmount === 0).filter(e => e.balance > 0).sort((a, b) => b.balance - a.balance)
        setTokenList(!account || sorted.length === 0 ? [] : sorted.map(e => e.asset))

        setInputToken(!account || sorted.length === 0 ? null : sorted[0].asset)
        setAction(AaveActionType.Withdraw)
        setSteps(getAaveActionSteps(AaveActionType.Withdraw))
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

  async function handleMainAction() {
    const val = Number(inputAmount)
    if (val === 0 || !inputToken || !account || !walletClient || !chain) return;

    if (chain?.id !== Number(vaultData.chainId)) {
      try {
        await switchNetworkAsync?.(Number(vaultData.chainId));
      } catch (error) {
        return
      }
    }

    const stepsCopy = [...steps]
    const currentStep = stepsCopy[stepCounter]
    currentStep.loading = true
    setSteps(stepsCopy)

    const aaveInteraction = await handleAaveInteraction({
      action,
      stepCounter,
      chainId: vaultData.chainId,
      amount: (val * (10 ** inputToken.decimals)),
      inputToken,
      account,
      clients: { publicClient, walletClient },
    })
    const success = await aaveInteraction()

    currentStep.loading = false
    currentStep.success = success;
    currentStep.error = !success;
    const newStepCounter = stepCounter + 1
    setSteps(stepsCopy)
    setStepCounter(newStepCounter)

    if (newStepCounter === steps.length) {
      const newBalance = await publicClient.readContract({
        address: inputToken.address,
        abi: ERC20Abi,
        functionName: "balanceOf",
        args: [account]
      })

      // Modify zap assets
      const zapAssetFound = zapAssets[chain.id].find(asset => asset.address === inputToken.address)
      if (zapAssetFound) {
        zapAssetFound.balance = Number(newBalance)
        setZapAssets({ ...zapAssets, [chain.id]: [...zapAssets[chain.id], zapAssetFound] })
      }

      // Modify vaults, assets and gauges
      const newVaultState: VaultData[] = [...vaults]
      newVaultState.forEach(vaultData => {
        if (vaultData.chainId === chain.id && vaultData.asset.address === inputToken.address) {
          vaultData.asset.balance = Number(newBalance)
        }
      })
      setVaults(newVaultState)

      const newAaveData = await fetchAaveData(account || zeroAddress, chain)
      setAaveReserveData({ ...reserveData, [chain.id]: newAaveData.reserveData })
      setAaveAccountData({ ...aaveAccountData, [chain.id]: newAaveData.userAccountData })
    }
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
                {(stepCounter === steps.length || steps.some(step => !step.loading && step.error)) ?
                  <MainActionButton label={"Finish"} handleClick={() => setVisible(false)} /> :
                  <MainActionButton label={steps[stepCounter].label} handleClick={handleMainAction} disabled={inputAmount === "0" || steps[stepCounter].loading} />
                }
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
              chainId={vaultData.chainId}
            />
          }
        </div>
      </div>
    </Modal>
  </>
}

export function getHealthFactorColor(suffix: string, healthFactor: number): string {
  if (!healthFactor) return `${suffix}-white`
  if (healthFactor === 0) {
    return `${suffix}-white`
  } else if (healthFactor > 3) {
    return `${suffix}-green-500`
  } else if (healthFactor > 1.3) {
    return `${suffix}-yellow-500`
  } else {
    return `${suffix}-red-500`
  }
}

export function AaveUserAccountData({ supplyToken, borrowToken, inputToken, inputAmount, activeTab, chainId }
  : { supplyToken: Token, borrowToken: Token, inputToken: Token, inputAmount: number, activeTab: string, chainId: number }): JSX.Element {
  const [reserveData] = useAtom(aaveReserveDataAtom)
  const [userAccountData] = useAtom(aaveAccountDataAtom)

  const [supplyReserve, setSupplyReserve] = useState<ReserveData>()
  const [borrowReserve, setBorrowReserve] = useState<ReserveData>()

  useEffect(() => {
    if (reserveData) {
      if (supplyToken) {
        setSupplyReserve(reserveData[chainId].find(e => e.asset.address === supplyToken.address))
      }
      if (reserveData) {
        setBorrowReserve(reserveData[chainId].find(e => e.asset.address === borrowToken.address))
      }
    }
  }, [supplyToken, borrowToken, reserveData])

  const [newUserAccountData, setNewUserAccountData] = useState<UserAccountData>(EMPTY_USER_ACCOUNT_DATA)
  const [oldInputAmount, setOldInputAmount] = useState<number>(0);

  useEffect(() => {
    if (inputToken.symbol === "none") return
    const newReserveData = [...reserveData[chainId]]
    const value = Number(inputAmount) - oldInputAmount
    setOldInputAmount(Number(inputAmount))

    switch (activeTab) {
      case "Supply":
        newReserveData[newReserveData.findIndex(e => e.asset.address === inputToken.address)].supplyAmount += value

        setNewUserAccountData({ ...calcUserAccountData(newReserveData, userAccountData[chainId].ltv) })
        return;
      case "Borrow":
        newReserveData[newReserveData.findIndex(e => e.asset.address === inputToken.address)].borrowAmount += value

        setNewUserAccountData({ ...calcUserAccountData(newReserveData, userAccountData[chainId].ltv) })
        return;
      case "Repay":
        newReserveData[newReserveData.findIndex(e => e.asset.address === inputToken.address)].borrowAmount -= value

        setNewUserAccountData(calcUserAccountData(newReserveData, userAccountData[chainId].ltv))
        return;
      case "Withdraw":
        newReserveData[newReserveData.findIndex(e => e.asset.address === inputToken.address)].supplyAmount -= value

        setNewUserAccountData(calcUserAccountData(newReserveData, userAccountData[chainId].ltv))
        return;
      default:
        return;
    }
  }, [inputAmount, activeTab])

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
                  className={getHealthFactorColor("text", userAccountData[chainId].healthFactor)}
                >
                  {formatToFixedDecimals(userAccountData[chainId].healthFactor || 0, 2)}
                </Title>
                {inputAmount > 0 &&
                  <>
                    <ArrowRightIcon className="w-4 h-3 text-white" />
                    <Title
                      as="p"
                      level={2}
                      fontWeight="font-normal"
                      className={getHealthFactorColor("text", newUserAccountData.healthFactor)}
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
                  $ {formatNumber(userAccountData[chainId].netValue || 0)}
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
                  {formatToFixedDecimals(userAccountData[chainId].netRate || 0, 2)} %
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