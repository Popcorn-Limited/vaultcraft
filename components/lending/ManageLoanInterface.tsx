import AssetWithName from "@/components/common/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { ReserveData, Token, UserAccountData, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { zeroAddress } from "viem";
import { EMPTY_BALANCE, NumberFormatter, validateInput } from "@/lib/utils/helpers";
import MainActionButton from "@/components/button/MainActionButton";
import { tokensAtom } from "@/lib/atoms";
import TabSelector from "@/components/common/TabSelector";
import Modal from "@/components/modal/Modal";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import TokenIcon from "@/components/common/TokenIcon";
import { EMPTY_USER_ACCOUNT_DATA, aaveAccountDataAtom, aaveReserveDataAtom } from "@/lib/atoms/lending";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ActionStep, getAaveActionSteps } from "@/lib/getActionSteps";
import handleAaveInteraction, { AaveActionType } from "@/lib/external/aave/handleAaveInteractions";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import CardStat from "@/components/common/CardStat";
import { fetchAaveData, getHealthFactorColor, calcUserAccountData } from "@/lib/external/aave";

const LOAN_TABS = ["Supply", "Borrow", "Repay", "Withdraw"]

export default function ManageLoanInterface({ visibilityState, vaultData }: { visibilityState: [boolean, Dispatch<SetStateAction<boolean>>], vaultData: VaultData }): JSX.Element {
  const [visible, setVisible] = visibilityState

  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const [reserveData, setAaveReserveData] = useAtom(aaveReserveDataAtom)
  const [aaveAccountData, setAaveAccountData] = useAtom(aaveAccountDataAtom)
  const [vaults, setVaults] = useAtom(vaultsAtom)
  const [tokens, setTokens] = useAtom(tokensAtom)

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
    if (Object.keys(reserveData).length > 0 && Object.keys(vaultData).length > 0 && Object.keys(tokens).length > 0 && reserveData[vaultData.chainId]?.length > 0) {
      let sorted = reserveData[vaultData.chainId].sort((a, b) => Number(a.balance.formatted) - Number(b.balance.formatted))
      setTokenList(sorted.map(e => tokens[vaultData.chainId][e.asset]))

      const _supplyToken = sorted[0].asset === vaultData.asset ? reserveData[vaultData.chainId][1].asset : reserveData[vaultData.chainId][0].asset
      setSupplyToken(tokens[vaultData.chainId][_supplyToken])
      setInputToken(tokens[vaultData.chainId][_supplyToken])
      setBorrowToken(
        !!reserveData[vaultData.chainId].find(e => e.asset === vaultData.asset) ?
          tokens[vaultData.chainId][vaultData.asset] :
          tokens[vaultData.chainId][reserveData[vaultData.chainId][0].asset]
      )

      sorted = reserveData[vaultData.chainId].filter(e => e.borrowAmount > 0).sort((a, b) => b.borrowAmount - a.borrowAmount)
      setRepayToken(sorted.length === 0 ? null : tokens[vaultData.chainId][sorted[0].asset])

      sorted = reserveData[vaultData.chainId].filter(e => e.borrowAmount === 0).filter(e => Number(e.balance.formatted) > 0).sort((a, b) => Number(b.balance.formatted) - Number(a.balance.formatted))
      setWithdrawToken(!account || sorted.length === 0 ? null : tokens[vaultData.chainId][sorted[0].asset])
    }
  }, [reserveData, vaultData, tokens])

  function changeTab(newTab: string) {
    setActiveTab(newTab);
    setInputAmount("0");
    setStepCounter(0);

    const assetBorrowable = !!reserveData[vaultData.chainId].find(e => e.asset === vaultData.asset);
    let sorted: ReserveData[]
    let _inputToken: Token

    switch (newTab) {
      case "Supply":
        sorted = reserveData[vaultData.chainId].filter(e => e.asset !== vaultData.asset).sort((a, b) => Number(b.balance.formatted) - Number(a.balance.formatted))
        setTokenList(sorted.map(e => tokens[vaultData.chainId][e.asset]))

        if (!supplyToken) {
          _inputToken = tokens[vaultData.chainId][sorted[0].asset]
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
        setTokenList(sorted.map(e => tokens[vaultData.chainId][e.asset]))

        if (!borrowToken) {
          _inputToken = assetBorrowable ?
            tokens[vaultData.chainId][vaultData.asset]
            : tokens[vaultData.chainId][sorted[0].asset]
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
        setTokenList(sorted.length === 0 ? [] : sorted.map(e => tokens[vaultData.chainId][e.asset]))

        if (!repayToken) {
          setInputToken(sorted.length === 0 ? null : tokens[vaultData.chainId][sorted[0].asset])
        } else {
          setInputToken(repayToken)
        }
        setAction(AaveActionType.Repay)
        setSteps(getAaveActionSteps(AaveActionType.Repay))
        return;
      case "Withdraw":
        sorted = reserveData[vaultData.chainId].filter(e => e.supplyAmount > 0).sort((a, b) => b.supplyAmount - a.supplyAmount)
        setTokenList(!account || sorted.length === 0 ? [] : sorted.map(e => tokens[vaultData.chainId][e.asset]))

        if (!withdrawToken) {
          setInputToken(!account || sorted.length === 0 ? null : tokens[vaultData.chainId][sorted[0].asset])
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
      const reserveTokenData = reserveData[vaultData.chainId].find(d => d.asset === inputToken?.address)
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
              String(Number(reserveData[vaultData.chainId].find(d => d.asset === inputToken?.address)?.balance.formatted || 0) * (10 ** inputToken.decimals))
          }
        })
      case "Repay":
        handleChangeInput({
          currentTarget: {
            value:
              String((reserveData[vaultData.chainId].find(d => d.asset === inputToken?.address)?.borrowAmount || 0) * (10 ** inputToken.decimals))
          }
        })
      default:
        handleChangeInput({ currentTarget: { value: inputToken.balance.formatted } })
    }
  }

  async function handleMainAction() {
    if (Number(inputAmount) === 0 || !inputToken || !account || !walletClient || !chain) return;

    if (chain?.id !== Number(vaultData.chainId)) {
      try {
        await switchChainAsync?.({ chainId: vaultData.chainId });
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
      val >= ((reserveData[vaultData.chainId].find(d => d.asset === repayToken?.address)?.borrowAmount || 0) * (10 ** inputToken.decimals))) {
      val = -1
    } else if (AaveActionType.Withdraw === action &&
      val === (Number(reserveData[vaultData.chainId].find(d => d.asset === repayToken?.address)?.balance.formatted || 0) * (10 ** inputToken.decimals))) {
      val = -1
    }

    const aaveInteraction = await handleAaveInteraction({
      action,
      stepCounter,
      chainId: vaultData.chainId,
      amount: val,
      inputToken,
      account,
      clients: { publicClient: publicClient!, walletClient },
    })
    const success = await aaveInteraction()

    currentStep.loading = false
    currentStep.success = success;
    currentStep.error = !success;
    const newStepCounter = stepCounter + 1
    setSteps(stepsCopy)
    setStepCounter(newStepCounter)

    if (newStepCounter === steps.length && success) {
      await mutateTokenBalance({
        tokensToUpdate: [inputToken.address],
        account,
        tokensAtom: [tokens, setTokens],
        chainId: chain.id
      })

      const newAaveData = await fetchAaveData(account || zeroAddress, tokens[chain.id], chain)
      setAaveReserveData({ ...reserveData, [chain.id]: newAaveData.reserveData })
      setAaveAccountData({ ...aaveAccountData, [chain.id]: newAaveData.userAccountData })
    }
  }


  return <>
    <Modal
      visibility={visibilityState}
      title={vaultData.address ?
        <AssetWithName vault={vaultData} /> :
        <h2 className={`text-2xl font-bold text-white`}>
          Lending
        </h2>
      }
    >
      <div className="w-full md:flex md:flex-row md:space-x-8">
        <div className="w-full md:w-1/3">
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
                    balance: reserveData[vaultData.chainId].find(d => d.asset === inputToken?.address)?.balance
                      || EMPTY_BALANCE
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
                    (reserveData[vaultData.chainId].find(d => d.asset === repayToken?.address)?.borrowAmount < 0.001
                      // @ts-ignore
                      && reserveData[vaultData.chainId].find(d => d.asset === repayToken?.address)?.borrowAmount > 0)
                      ? "<0.001"
                      // @ts-ignore
                      : `${NumberFormatter.format(reserveData[vaultData.chainId].find(d => d.asset === repayToken?.address)?.borrowAmount)}`}
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
        <div className="w-full md:w-2/3 mt-8 md:mt-0">
          {(!!reserveData && !!supplyToken && !!borrowToken) &&
            <AaveUserAccountData
              supplyToken={supplyToken}
              borrowToken={borrowToken}
              inputToken={inputToken ||
              {
                name: "Choose an Asset",
                symbol: "none",
                decimals: 0,
                logoURI: "",
                address: zeroAddress,
                balance: EMPTY_BALANCE,
                totalSupply: BigInt(0),
                price: 0,
              }}
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

export function AaveUserAccountData({ supplyToken, borrowToken, inputToken, inputAmount, activeTab, chainId }
  : { supplyToken: Token, borrowToken: Token, inputToken: Token, inputAmount: number, activeTab: string, chainId: number }): JSX.Element {
  const [tokens, setTokens] = useAtom(tokensAtom)
  const [reserveData] = useAtom(aaveReserveDataAtom)
  const [userAccountData] = useAtom(aaveAccountDataAtom)

  const [supplyReserve, setSupplyReserve] = useState<ReserveData>()
  const [borrowReserve, setBorrowReserve] = useState<ReserveData>()

  useEffect(() => {
    if (reserveData) {
      if (supplyToken) {
        setSupplyReserve(reserveData[chainId].find(e => e.asset === supplyToken.address))
      }
      if (reserveData) {
        setBorrowReserve(reserveData[chainId].find(e => e.asset === borrowToken.address))
      }
    }
  }, [supplyToken, borrowToken, reserveData])

  const [newUserAccountData, setNewUserAccountData] = useState<UserAccountData>(EMPTY_USER_ACCOUNT_DATA)
  const [oldInputAmount, setOldInputAmount] = useState<number>(0);

  useEffect(() => {
    if (inputToken.symbol === "none") return
    const newReserveData = [...reserveData[chainId]]
    const value = Number(inputAmount) - oldInputAmount

    console.log({ inputToken, newReserveData, inputAmount, value })

    setOldInputAmount(Number(inputAmount))

    switch (activeTab) {
      case "Supply":
        newReserveData[newReserveData.findIndex(e => e.asset === inputToken.address)].supplyAmount += value

        setNewUserAccountData({ ...calcUserAccountData(newReserveData, tokens[chainId], userAccountData[chainId].ltv) })
        return;
      case "Borrow":
        newReserveData[newReserveData.findIndex(e => e.asset === inputToken.address)].borrowAmount += value

        setNewUserAccountData({ ...calcUserAccountData(newReserveData, tokens[chainId], userAccountData[chainId].ltv) })
        return;
      case "Repay":
        newReserveData[newReserveData.findIndex(e => e.asset === inputToken.address)].borrowAmount -= value

        setNewUserAccountData(calcUserAccountData(newReserveData, tokens[chainId], userAccountData[chainId].ltv))
        return;
      case "Withdraw":
        newReserveData[newReserveData.findIndex(e => e.asset === inputToken.address)].supplyAmount -= value

        setNewUserAccountData(calcUserAccountData(newReserveData, tokens[chainId], userAccountData[chainId].ltv))
        return;
      default:
        return;
    }
  }, [inputAmount, activeTab])

  return (supplyReserve && borrowReserve) ? (
    <>
      <div className="w-full space-y-4">
        <div className="border border-customNeutral100 rounded-lg p-4">
          <div className="w-full flex flex-row justify-between">

            <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-4 text-start">
              <CardStat
                id={`health-factor`}
                label="Health Factor"
                tooltip="Measures your loan's safety, showing how much your collateral value can drop before risking liquidation. Higher values mean greater safety from being liquidated."
              >
                <span className="w-full text-end md:text-start">
                  <p className="text-white text-xl">
                    {NumberFormatter.format(userAccountData[chainId].healthFactor || 0)}
                  </p>
                  {inputAmount > 0 &&
                    <>
                      <p className={`text-sm ${getHealthFactorColor("text", newUserAccountData.healthFactor)}`}>
                        {NumberFormatter.format(newUserAccountData.healthFactor || 0)}
                      </p>
                    </>}
                </span>
              </CardStat>
              <CardStat
                id={`av-credit`}
                label="Av. Credit"

                tooltip="Maximum additional amount you can borrow, based on the value of your collateral."
              >
                <span className="w-full text-end md:text-start">
                  <p className="text-white text-xl">
                    $ {NumberFormatter.format(((userAccountData[chainId].ltv * userAccountData[chainId].totalCollateral) - userAccountData[chainId].totalBorrowed) || 0)}
                  </p>
                  {inputAmount > 0 &&
                    <>
                      <p className={`text-sm text-white`}>
                        $ {NumberFormatter.format(((newUserAccountData.ltv * newUserAccountData.totalCollateral) - newUserAccountData.totalBorrowed) || 0)}
                      </p>
                    </>}
                </span>
              </CardStat>
              <CardStat
                id={`net-apy`}
                label="Net Apy"
                tooltip="Net yield from your lending and borrowing activities, considering all associated fees."
              >
                <span className="w-full text-end md:text-start">
                  <p className="text-white text-xl">
                    {NumberFormatter.format(userAccountData[chainId].netRate || 0)} %
                  </p>
                  {inputAmount > 0 &&
                    <>
                      <p className={`text-sm text-white`}>
                        {NumberFormatter.format(newUserAccountData.netRate || 0)} %
                      </p>
                    </>}
                </span>
              </CardStat>
              <CardStat
                id={`collateral`}
                label="Collateral"
                tooltip="Total value of all assets you've deposited to secure your borrowed funds."
              >
                <span className="w-full text-end md:text-start">
                  <p className="text-white text-xl">
                    $ {NumberFormatter.format(userAccountData[chainId].totalCollateral || 0)}
                  </p>
                  {inputAmount > 0 &&
                    <>
                      <p className={`text-sm text-white`}>
                        $ {NumberFormatter.format(newUserAccountData.totalCollateral || 0)}
                      </p>
                    </>}
                </span>
              </CardStat>
              <CardStat
                id={`borrowed`}
                label="Borrowed"
                tooltip="Total amount of funds you have currently borrowed."
              >
                <span className="w-full text-end md:text-start">
                  <p className="text-white text-xl">
                    $ {NumberFormatter.format(userAccountData[chainId].totalBorrowed || 0)}
                  </p>
                  {inputAmount > 0 &&
                    <>
                      <p className={`text-sm text-white`}>
                        $ {NumberFormatter.format(newUserAccountData.totalBorrowed || 0)}
                      </p>
                    </>}
                </span>
              </CardStat>
              <CardStat
                id={`nlv`}
                label="Net Loan Value"
                tooltip="Current net value of all your active loans, minus any repayments."
              >
                <span className="w-full text-end md:text-start">
                  <p className="text-white text-xl">
                    $ {NumberFormatter.format(userAccountData[chainId].netValue || 0)}
                  </p>
                  {inputAmount > 0 &&
                    <>
                      <p className={`text-sm text-white`}>
                        $ {NumberFormatter.format(newUserAccountData.netValue || 0)}
                      </p>
                    </>}
                </span>
              </CardStat>
            </div>
          </div>
        </div>


        <div className="border border-customNeutral100 rounded-lg p-4">
          <div className="w-full flex flex-row justify-between">

            <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-4 text-start">
              <CardStat
                id={`lending-apy`}
                label="Lending Apy"
                tooltip="Annual yield you earn from lending out the selected asset."
              >
                <div className="w-full flex justify-end md:justify-start">
                  <span className="flex flex-row items-center">
                    <TokenIcon token={supplyToken} icon={supplyToken.logoURI} chainId={10} imageSize={"w-6 h-6 mb-0.5"} />
                    <p className="ml-2 mb-1.5 text-xl text-white">
                      {NumberFormatter.format(supplyReserve.supplyRate || 0)} %
                    </p>
                  </span>
                </div>
              </CardStat>
              <CardStat
                id={`borrow-apy`}
                label="Borrow Apy"
                tooltip="Annual interest rate you are charged on your borrowed funds on the selected asset."
              >
                <div className="w-full flex justify-end md:justify-start">
                  <span className="flex flex-row items-center">
                    <TokenIcon token={borrowToken} icon={borrowToken.logoURI} chainId={10} imageSize={"w-6 h-6 mb-0.5"} />
                    <p className="ml-2 mb-1.5 text-xl text-white">
                      {NumberFormatter.format(borrowReserve.borrowRate || 0)} %
                    </p>
                  </span>
                </div>
              </CardStat>
              <CardStat
                id={`none`}
                label=""
                value=""
                tooltip=""
              />
              <CardStat
                id={`max-ltv`}
                label="Max LTV"
                value={`${supplyReserve.ltv.toFixed(2)} %`}
                tooltip="Highest ratio of loan amount to collateral value that you can borrow, reflecting your borrowing capacity."
              />
              <CardStat
                id={`liq-threshold`}
                label="Liquidation Threshold"
                value={`${supplyReserve.liquidationThreshold.toFixed(2)} %`}
                tooltip="Point where your debt reaches a specific percentage of your collateral value, indicating the debt is undercollateralized and triggering a risk of liquidation."
              />
              <CardStat
                id={`liq-penalty`}
                label="Liquidation Penalty"
                value={`${supplyReserve.liquidationPenalty.toFixed(2)} %`}
                tooltip="Fee or cost added to your debt when your loan is liquidated, typically benefiting the liquidator who covers part of your borrowed amount."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  ) : <div className="w-full space-y-4">
    <p className="text-white">Data loading...</p>
  </div>
}