import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { FeeConfiguration, ReserveData, Token, UserAccountData, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { useAccount, useBalance, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { Address, WalletClient, createPublicClient, extractChain, formatUnits, getAddress, http, maxUint256, zeroAddress } from "viem";
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
import { ERC20Abi, ZERO } from "@/lib/constants";

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
  const [repayToken, setRepayToken] = useState<Token | null>(null)
  const [withdrawToken, setWithdrawToken] = useState<Token | null>(null)

  const [inputToken, setInputToken] = useState<Token | null>(null)

  useEffect(() => {
    if (reserveData && reserveData[vaultData.chainId]) {
      let sorted = reserveData[vaultData.chainId].sort((a, b) => a.balance - b.balance)
      setTokenList(sorted.map(e => e.asset))

      const _supplyToken = sorted[0].asset.address === vaultData.asset.address ? reserveData[vaultData.chainId][1].asset : reserveData[vaultData.chainId][0].asset
      setSupplyToken(_supplyToken)
      setInputToken(_supplyToken)
      setBorrowToken(!!reserveData[vaultData.chainId].find(e => e.asset.address === vaultData.asset.address) ? vaultData.asset : reserveData[vaultData.chainId][0].asset)

      sorted = reserveData[vaultData.chainId].filter(e => e.borrowAmount > 0).sort((a, b) => b.borrowAmount - a.borrowAmount)
      setRepayToken(sorted.length === 0 ? null : sorted[0].asset)

      sorted = reserveData[vaultData.chainId].filter(e => e.borrowAmount === 0).filter(e => e.balance > 0).sort((a, b) => b.balance - a.balance)
      setWithdrawToken(!account || sorted.length === 0 ? null : sorted[0].asset)
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

        if (!supplyToken) {
          _inputToken = sorted[0].asset
          setSupplyToken(_inputToken)
          setInputToken(_inputToken)
        } else {
          setInputToken(supplyToken)
        }
        setAction(AaveActionType.Supply)
        setSteps(getAaveActionSteps(AaveActionType.Supply))
        return;
      case "Borrow":
        sorted = reserveData[vaultData.chainId].sort((a, b) => b.borrowRate - a.borrowRate)
        setTokenList(sorted.map(e => e.asset))

        if (!borrowToken) {
          _inputToken = assetBorrowable ? vaultData.asset : sorted[0].asset
          setBorrowToken(_inputToken)
          setInputToken(_inputToken)
        } else {
          setInputToken(borrowToken)
        }
        setAction(AaveActionType.Borrow)
        setSteps(getAaveActionSteps(AaveActionType.Borrow))
        return;
      case "Repay":
        sorted = reserveData[vaultData.chainId].filter(e => e.borrowAmount > 0).sort((a, b) => b.borrowAmount - a.borrowAmount)
        setTokenList(sorted.length === 0 ? [] : sorted.map(e => e.asset))

        if (!repayToken) {
          setInputToken(sorted.length === 0 ? null : sorted[0].asset)
        } else {
          setInputToken(repayToken)
        }
        setAction(AaveActionType.Repay)
        setSteps(getAaveActionSteps(AaveActionType.Repay))
        return;
      case "Withdraw":
        sorted = reserveData[vaultData.chainId].filter(e => e.supplyAmount > 0).sort((a, b) => b.supplyAmount - a.supplyAmount)
        setTokenList(!account || sorted.length === 0 ? [] : sorted.map(e => e.asset))

        if (!withdrawToken) {
          setInputToken(!account || sorted.length === 0 ? null : sorted[0].asset)
        } else {
          setInputToken(withdrawToken)
        }
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
        setRepayToken(input)
        setInputToken(input)
        return;
      case "Withdraw":
        setWithdrawToken(input)
        setInputToken(input)
        return;
      default:
        return;
    }
  }

  const [inputAmount, setInputAmount] = useState<string>("0");

  function handleChangeInput(e: any) {
    let value = e.currentTarget.value
    value = validateInput(value).isValid ? value : "0"

    if (activeTab === "Repay") {
      const reserveTokenData = reserveData[vaultData.chainId].find(d => d.asset.address === inputToken?.address)
      if (reserveTokenData && reserveTokenData.borrowAmount < Number(value)) {
        value = String(reserveTokenData.borrowAmount)
      }
    }

    setInputAmount(value);
  };

  function handleMaxClick() {
    if (!inputToken) return
    switch (activeTab) {
      case "Withdraw":
        handleChangeInput({
          currentTarget: {
            value:
              String((reserveData[vaultData.chainId].find(d => d.asset.address === inputToken?.address)?.balance || 0) * (10 ** inputToken.decimals))
          }
        })
      case "Repay":
        handleChangeInput({
          currentTarget: {
            value:
              String((reserveData[vaultData.chainId].find(d => d.asset.address === inputToken?.address)?.borrowAmount || 0) * (10 ** inputToken.decimals))
          }
        })
      default:
        const stringBal = inputToken.balance.toLocaleString("fullwide", { useGrouping: false })
        const rounded = safeRound(BigInt(stringBal), inputToken.decimals)
        const formatted = formatUnits(rounded, inputToken.decimals)
        handleChangeInput({ currentTarget: { value: formatted } })
    }
  }

  async function handleMainAction() {
    if (Number(inputAmount) === 0 || !inputToken || !account || !walletClient || !chain) return;

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

    let val = (Number(inputAmount) * (10 ** inputToken.decimals))
    if (AaveActionType.Repay === action &&
      val >= ((reserveData[vaultData.chainId].find(d => d.asset.address === repayToken?.address)?.borrowAmount || 0) * (10 ** inputToken.decimals))) {
      val = Number(maxUint256)
    } else if (AaveActionType.Withdraw === action &&
      val === ((reserveData[vaultData.chainId].find(d => d.asset.address === repayToken?.address)?.balance || 0) * (10 ** inputToken.decimals))) {
      val = Number(maxUint256)
    }

    const aaveInteraction = await handleAaveInteraction({
      action,
      stepCounter,
      chainId: vaultData.chainId,
      amount: val,
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

  if (reserveData && reserveData[vaultData.chainId]) console.log(reserveData[vaultData.chainId])

  return <>
    <Modal
      visibility={visibilityState}
      title={vaultData.address ?
        <AssetWithName vault={vaultData} /> :
        <h2 className={`text-2xl font-bold text-primary`}>
          Lending
        </h2>
      }
    >
      <div className="flex flex-row space-x-8">
        <div className="w-1/3">
          <TabSelector
            className="mb-6"
            availableTabs={LOAN_TABS}
            activeTab={activeTab}
            setActiveTab={changeTab}
          />
          {!account &&
            <div>
              <MainActionButton
                label="Connect Wallet"
                handleClick={openConnectModal}
              />
            </div>
          }
          {
            (account && !inputToken) &&
            <p className="text-white">Nothing to do here</p>
          }
          {(account && inputToken && reserveData && reserveData[vaultData.chainId]) &&
            <>
              <InputTokenWithError
                captionText={`${activeTab} Amount`}
                onSelectToken={handleTokenSelect}
                onMaxClick={handleMaxClick}
                chainId={vaultData.chainId}
                value={inputAmount}
                onChange={handleChangeInput}
                selectedToken={activeTab === "Withdraw" ?
                  {
                    ...inputToken,
                    balance: reserveData[vaultData.chainId].find(d => d.asset.address === inputToken?.address)?.balance || 0
                  }
                  : inputToken}
                errorMessage={""}
                tokenList={tokenList}
                allowSelection
                allowInput
              />
              {(activeTab === "Repay" && repayToken && reserveData && reserveData[vaultData.chainId]) &&
                <p className="text-start text-white">
                  Borrowed: {
                    // @ts-ignore
                    (reserveData[vaultData.chainId].find(d => d.asset.address === repayToken?.address)?.borrowAmount < 0.001
                      // @ts-ignore
                      && reserveData[vaultData.chainId].find(d => d.asset.address === repayToken?.address)?.borrowAmount > 0)
                      ? "<0.001"
                      // @ts-ignore
                      : `${formatNumber(reserveData[vaultData.chainId].find(d => d.asset.address === repayToken?.address)?.borrowAmount)}`}
                </p>
              }
              <div className="mt-8">
                {(stepCounter === steps.length || steps.some(step => !step.loading && step.error)) ?
                  <MainActionButton label={"Finish"} handleClick={() => setVisible(false)} /> :
                  <MainActionButton label={steps[stepCounter].label} handleClick={handleMainAction} disabled={inputAmount === "0" || steps[stepCounter].loading} />
                }
              </div>
            </>
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
              <p className="text-start text-primary font-normal md:text-[14px]">Available Credit</p>
              <span className="flex flex-row items-center space-x-1">
                <Title as="p" level={2} fontWeight="font-normal" className="text-primary">
                  $ {formatToFixedDecimals(((userAccountData[chainId].ltv * userAccountData[chainId].totalCollateral) - userAccountData[chainId].totalBorrowed) || 0, 2)}
                </Title>
                {inputAmount > 0 &&
                  <>
                    <ArrowRightIcon className="w-4 h-3 text-white" />
                    <Title as="p" level={2} fontWeight="font-normal" className="text-primary">
                      $ {formatToFixedDecimals(((newUserAccountData.ltv * newUserAccountData.totalCollateral) - newUserAccountData.totalBorrowed) || 0, 2)}
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

          <div className="w-full flex flex-row justify-between mt-4">

            <div className="w-1/3">
              <p className="text-start text-primary font-normal md:text-[14px]">Collateral</p>
              <span className="flex flex-row items-center space-x-1">
                <Title
                  as="p"
                  level={2}
                  fontWeight="font-normal"
                >
                  {formatToFixedDecimals(userAccountData[chainId].totalCollateral || 0, 2)}
                </Title>
                {inputAmount > 0 &&
                  <>
                    <ArrowRightIcon className="w-4 h-3 text-white" />
                    <Title
                      as="p"
                      level={2}
                      fontWeight="font-normal"
                    >
                      {formatToFixedDecimals(newUserAccountData.totalCollateral || 0, 2)}
                    </Title>
                  </>}
              </span>
            </div>

            <div className="w-1/3">
              <p className="text-start text-primary font-normal md:text-[14px]">Borrowed</p>
              <span className="flex flex-row items-center space-x-1">
                <Title as="p" level={2} fontWeight="font-normal" className="text-primary">
                  $ {formatNumber(userAccountData[chainId].totalBorrowed || 0)}
                </Title>
                {inputAmount > 0 &&
                  <>
                    <ArrowRightIcon className="w-4 h-3 text-white" />
                    <Title as="p" level={2} fontWeight="font-normal" className="text-primary">
                      $ {formatNumber(newUserAccountData.totalBorrowed || 0)}
                    </Title>
                  </>
                }
              </span>
            </div>

            <div className="w-1/3">
              <p className="text-start text-primary font-normal md:text-[14px]">Net Loan Value</p>
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