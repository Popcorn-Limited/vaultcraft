import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { FeeConfiguration, ReserveData, Token, UserAccountData, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAccount, useBalance, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { Address, WalletClient, createPublicClient, extractChain, formatUnits, getAddress, http, maxUint256, zeroAddress } from "viem";
import { NumberFormatter, formatAndRoundNumber, formatNumber, formatToFixedDecimals, safeRound } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces, validateInput } from "@/lib/utils/helpers";
import MainActionButton from "@/components/button/MainActionButton";
import { ArrowDownIcon, ArrowRightIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { DEFAULT_ASSET, availableZapAssetAtom, tokensAtom, zapAssetsAtom } from "@/lib/atoms";
import TabSelector from "@/components/common/TabSelector";
import Modal from "@/components/modal/Modal";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import TokenIcon from "@/components/common/TokenIcon";
import { EMPTY_USER_ACCOUNT_DATA, aaveAccountDataAtom, aaveReserveDataAtom } from "@/lib/atoms/lending";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ActionStep, getAaveActionSteps } from "@/lib/getActionSteps";
import handleAaveInteraction, { AaveActionType } from "@/lib/external/aave/handleAaveInteractions";
import { calcUserAccountData, fetchAaveData } from "@/lib/external/aave/interactions";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import CardStat from "@/components/common/CardStat";
import Slider from "rc-slider";

export default function InstantLoanInterface({ visibilityState, vaultData }: { visibilityState: [boolean, Dispatch<SetStateAction<boolean>>], vaultData: VaultData }): JSX.Element {
  const [visible, setVisible] = visibilityState

  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const [reserveData, setAaveReserveData] = useAtom(aaveReserveDataAtom)
  const [aaveAccountData, setAaveAccountData] = useAtom(aaveAccountDataAtom)
  const [tokens, setTokens] = useAtom(tokensAtom)

  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();

  const [tokenList, setTokenList] = useState<Token[]>([])
  const [tokenIn, setTokenIn] = useState<Token | null>(null)
  const [tokenMid, setTokenMid] = useState<Token | null>(null)
  const [tokenOut, setTokenOut] = useState<Token | null>(null)

  useEffect(() => {
    if (Object.keys(reserveData).length > 0 && Object.keys(vaultData).length > 0 && Object.keys(tokens).length > 0 && reserveData[vaultData.chainId]?.length > 0) {
      // Set Basic Tokens
      setAsset(tokens[vaultData.chainId][vaultData.asset])
      setVault(tokens[vaultData.chainId][vaultData.vault])

      if (vaultData.gauge) {
        setGauge(tokens[vaultData.chainId][vaultData.gauge])
        setTokenOut(tokens[vaultData.chainId][vaultData.gauge])
      } else {
        setTokenOut(tokens[vaultData.chainId][vaultData.vault])
      }

      const sorted = reserveData[vaultData.chainId].sort((a, b) => a.balance - b.balance)
      setTokenList(sorted.map(e => tokens[vaultData.chainId][e.asset]))

      setTokenIn(tokens[vaultData.chainId][reserveData[vaultData.chainId].sort((a, b) => b.balanceValue - a.balanceValue)[0].asset])
      setTokenMid(reserveData[vaultData.chainId].find(e => e.asset === vaultData.asset)
        ? tokens[vaultData.chainId][vaultData.asset]
        : tokens[vaultData.chainId][sorted[0].asset]
      )
    }
  }, [reserveData, vaultData, tokens])

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>(getAaveActionSteps(AaveActionType.Supply))
  const [action, setAction] = useState<AaveActionType>(AaveActionType.Supply)
  const [isDeposit, setIsDeposit] = useState<boolean>(true);

  function changeTab() {
    if (isDeposit) {
      // Switch to "Withdraw"
      setTokenIn(gauge ? gauge! : vault!)

      const sorted = reserveData[vaultData.chainId].sort((a, b) => a.borrowValue - b.borrowValue)
      setTokenMid(reserveData[vaultData.chainId].find(e => e.asset === vaultData.asset)
        ? tokens[vaultData.chainId][vaultData.asset]
        : tokens[vaultData.chainId][sorted[0].asset]
      )
      setTokenOut(tokens[vaultData.chainId][reserveData[vaultData.chainId][0].asset])
    } else {
      // Switch to "Deposit"
      setTokenIn(tokens[vaultData.chainId][reserveData[vaultData.chainId].sort((a, b) => b.balanceValue - a.balanceValue)[0].asset])
      setTokenOut(gauge ? gauge! : vault!)

      const sorted = reserveData[vaultData.chainId].sort((a, b) => a.balance - b.balance)
      setTokenMid(reserveData[vaultData.chainId].find(e => e.asset === vaultData.asset)
        ? tokens[vaultData.chainId][vaultData.asset]
        : tokens[vaultData.chainId][sorted[0].asset]
      )
    }

    setIsDeposit(!isDeposit);
    setAmountIn("0");
    setAmountMid("0");
    setAmountOut("0");
    setLtv(0);
    setStepCounter(0);
  }

  function handleTokenSelect(input: Token) {
    // switch (activeTab) {
    //   case "Supply":
    //     setSupplyToken(input)
    //     setInputToken(input)
    //     return;
    //   case "Borrow":
    //     setBorrowToken(input)
    //     setInputToken(input)
    //     return;
    //   case "Repay":
    //     setRepayToken(input)
    //     setInputToken(input)
    //     return;
    //   case "Withdraw":
    //     setWithdrawToken(input)
    //     setInputToken(input)
    //     return;
    //   default:
    //     return;
    // }
  }

  const [amountIn, setAmountIn] = useState<string>("0");
  const [amountMid, setAmountMid] = useState<string>("0");
  const [amountOut, setAmountOut] = useState<string>("0");

  const [ltv, setLtv] = useState<number>(0);
  const [newUserAccountData, setNewUserAccountData] = useState<UserAccountData>(EMPTY_USER_ACCOUNT_DATA)

  function handleChangeInput(e: any) {
    if (!tokenIn || !tokenMid || !tokenOut) return

    let valueIn = e.currentTarget.value
    valueIn = validateInput(valueIn).isValid ? valueIn : "0"

    let valueMid = ((Number(valueIn) * tokenIn.price) * (ltv / 100)) / tokenMid.price;
    if (!isDeposit) {
      const reserveTokenData = reserveData[vaultData.chainId].find(d => d.asset === tokenMid?.address)
      if (reserveTokenData) {
        valueMid = valueMid > reserveTokenData.borrowAmount ? reserveTokenData.borrowAmount : valueMid;
      }
    }

    const valueOut = (valueMid * tokenMid.price) / tokenOut.price

    setAmountIn(valueIn)
    setAmountMid(String(valueMid))
    setAmountOut(String(valueOut))
  };

  function handleSlider(e: any) {
    setLtv(e as number)
    handleChangeInput({ currentTarget: { value: amountIn } })
  }

  function handleMaxClick() {
    if (!tokenIn) return
    // switch (activeTab) {
    //   case "Withdraw":
    //     handleChangeInput({
    //       currentTarget: {
    //         value:
    //           String((reserveData[vaultData.chainId].find(d => d.asset === tokenIn?.address)?.balance || 0) * (10 ** tokenIn.decimals))
    //       }
    //     })
    //   case "Repay":
    //     handleChangeInput({
    //       currentTarget: {
    //         value:
    //           String((reserveData[vaultData.chainId].find(d => d.asset === tokenIn?.address)?.borrowAmount || 0) * (10 ** tokenIn.decimals))
    //       }
    //     })
    //   default:
    //     const stringBal = tokenIn.balance.toLocaleString("fullwide", { useGrouping: false })
    //     const rounded = safeRound(BigInt(stringBal), tokenIn.decimals)
    //     const formatted = formatUnits(rounded, tokenIn.decimals)
    //     handleChangeInput({ currentTarget: { value: formatted } })
    // }
  }

  async function handleMainAction() {
    if (Number(amountIn) === 0 || !tokenIn || !account || !walletClient || !chain) return;

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

    let val = (Number(amountIn) * (10 ** tokenIn.decimals))
    if (!isDeposit &&
      val >= ((reserveData[vaultData.chainId].find(d => d.asset === tokenMid?.address)?.borrowAmount || 0) * (10 ** tokenIn.decimals))) {
      val = Number(maxUint256)
    }

    const aaveInteraction = await handleAaveInteraction({
      action,
      stepCounter,
      chainId: vaultData.chainId,
      amount: val,
      inputToken: tokenIn,
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

    if (newStepCounter === steps.length && success) {
      await mutateTokenBalance({
        tokensToUpdate: [tokenIn.address],
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
        <div className="w-full">
          <TabSelector
            className="w-full mb-6"
            availableTabs={["Deposit", "Withdraw"]}
            activeTab={isDeposit ? "Deposit" : "Withdraw"}
            setActiveTab={changeTab}
          />

          {(account && tokenIn && tokenMid && tokenOut && reserveData && reserveData[vaultData.chainId] && asset && vault) &&
            <>
              <InputTokenWithError
                captionText={isDeposit ? "Deposit Amount" : "Withdrawal Amount"}
                onSelectToken={handleTokenSelect}
                onMaxClick={handleMaxClick}
                chainId={vaultData.chainId}
                value={amountIn}
                onChange={handleChangeInput}
                selectedToken={tokenIn}
                errorMessage={""}
                tokenList={isDeposit ? tokenList : []}
                allowSelection={isDeposit}
                allowInput
              />
              <p className="text-customGray100 text-start">
                {isDeposit ? "Collateral" : "Withdraw"} Value: ${formatNumber(Number(amountIn) * tokenIn.price)}
              </p>
              <div className="relative py-4">
                <div className="relative flex justify-center">
                  <span className="px-4">
                    <ArrowDownIcon
                      className="h-10 w-10 p-2 text-customGray500 cursor-pointer hover:text-white hover:border-white"
                      aria-hidden="true"
                      onClick={() => { }}
                    />
                  </span>
                </div>
              </div>

              <InputTokenWithError
                captionText={isDeposit ? "Borrow Amount" : "Repay Amount"}
                onSelectToken={handleTokenSelect}
                onMaxClick={() => { }}
                chainId={vaultData.chainId}
                value={amountMid}
                onChange={() => { }}
                selectedToken={tokenMid}
                errorMessage={""}
                tokenList={tokenList.find(t => t.address === asset?.address) ? [asset] : tokenList}
                allowSelection={!tokenList.find(t => t.address === asset?.address)}
                allowInput={true}
              />

              <p className="text-customGray100 text-start">
                {isDeposit ? "Borrow" : "Repay"} Value: ${formatNumber(Number(amountMid) * tokenMid.price)}
              </p>

              <div className="w-full mt-4">
                <p className="text-white font-normal text-sm text-start">
                  {isDeposit ? `Loan To Value Ratio: ${ltv} / ${reserveData[vaultData.chainId][0].ltv}` : `Repayment Percentage: ${ltv} / 100`} %
                </p>
                <div className="flex flex-row items-center justify-between">
                  <div className="w-full mt-2">
                    <Slider
                      railStyle={{
                        backgroundColor: "#FFFFFF",
                        height: 4,
                      }}
                      trackStyle={{
                        backgroundColor: "#FFFFFF",
                        height: 4,
                      }}
                      handleStyle={{
                        height: 22,
                        width: 22,
                        marginLeft: 0,
                        marginTop: -9,
                        borderWidth: 4,
                        opacity: 1,
                        borderColor: "#C391FF",
                        backgroundColor: "#fff",
                        zIndex: 0,
                      }}
                      value={ltv}
                      onChange={handleSlider}
                      max={isDeposit ? reserveData[vaultData.chainId][0].ltv : 100}
                    />
                  </div>
                </div>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-customGray500" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-customNeutral200 px-4">
                    <ArrowDownIcon
                      className="h-10 w-10 p-2 text-customGray500 border border-customGray500 rounded-full cursor-pointer hover:text-white hover:border-white"
                      aria-hidden="true"
                      onClick={() => { }}
                    />
                  </span>
                </div>
              </div>

              <InputTokenWithError
                captionText={"Output Amount"}
                onSelectToken={handleTokenSelect}
                onMaxClick={handleMaxClick}
                chainId={vaultData.chainId}
                value={amountOut}
                onChange={() => { }}
                selectedToken={tokenOut}
                errorMessage={""}
                tokenList={isDeposit ? [] : tokenList}
                allowSelection={!isDeposit}
                allowInput={!isDeposit}
              />
              <p className="text-customGray100 text-start">
                Output Value: ${formatNumber(Number(amountOut) * tokenOut.price)}
              </p>

              <div className="mt-6">
                <p className="text-white font-bold mb-2 text-start">Action Breakdown</p>
                <div className="bg-customNeutral200 py-2 px-4 rounded-lg space-y-2">
                  <span className="flex flex-row items-center justify-between text-white">
                    <p>Net Loan Apy</p>
                    <p>3.2 %</p>
                  </span>
                  <span className="flex flex-row items-center justify-between text-white">
                    <p>Health Factor</p>
                    <p>5.42</p>
                  </span>
                  <span className="flex flex-row items-center justify-between text-white">
                    <p>Lending Net Worth</p>
                    <p>$ 400</p>
                  </span>
                </div>
              </div>

              <div className="mt-8">
                {(stepCounter === steps.length || steps.some(step => !step.loading && step.error)) ?
                  <MainActionButton label={"Finish"} handleClick={() => setVisible(false)} /> :
                  <MainActionButton label={steps[stepCounter].label} handleClick={handleMainAction} disabled={amountIn === "0" || steps[stepCounter].loading} />
                }
              </div>
            </>
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

export function AaveUserAccountData({ supplyToken, borrowToken, tokenIn, amountIn, activeTab, chainId }
  : { supplyToken: Token, borrowToken: Token, tokenIn: Token, amountIn: number, activeTab: string, chainId: number }): JSX.Element {
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
    if (tokenIn.symbol === "none") return
    const newReserveData = [...reserveData[chainId]]
    const value = Number(amountIn) - oldInputAmount

    console.log({ tokenIn, newReserveData, amountIn, value })

    setOldInputAmount(Number(amountIn))

    switch (activeTab) {
      case "Supply":
        newReserveData[newReserveData.findIndex(e => e.asset === tokenIn.address)].supplyAmount += value

        setNewUserAccountData({ ...calcUserAccountData(newReserveData, tokens[chainId], userAccountData[chainId].ltv) })
        return;
      case "Borrow":
        newReserveData[newReserveData.findIndex(e => e.asset === tokenIn.address)].borrowAmount += value

        setNewUserAccountData({ ...calcUserAccountData(newReserveData, tokens[chainId], userAccountData[chainId].ltv) })
        return;
      case "Repay":
        newReserveData[newReserveData.findIndex(e => e.asset === tokenIn.address)].borrowAmount -= value

        setNewUserAccountData(calcUserAccountData(newReserveData, tokens[chainId], userAccountData[chainId].ltv))
        return;
      case "Withdraw":
        newReserveData[newReserveData.findIndex(e => e.asset === tokenIn.address)].supplyAmount -= value

        setNewUserAccountData(calcUserAccountData(newReserveData, tokens[chainId], userAccountData[chainId].ltv))
        return;
      default:
        return;
    }
  }, [amountIn, activeTab])

  return (supplyReserve && borrowReserve) ? (
    <>
      <div className="w-full space-y-4">
        <div className="border border-customNeutral100 rounded-lg p-4">
          <div className="w-full flex flex-row justify-between">

            <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-4 text-start">
              <CardStat
                id={`health-factor`}
                label="Health Factor"
                tooltip="Health Factor Tooltip"
              >
                <span className="w-full text-end md:text-start">
                  <p className="text-white text-xl">
                    {formatToFixedDecimals(userAccountData[chainId].healthFactor || 0, 2)}
                  </p>
                  {amountIn > 0 &&
                    <>
                      <p className={`text-sm ${getHealthFactorColor("text", newUserAccountData.healthFactor)}`}>
                        {formatToFixedDecimals(newUserAccountData.healthFactor || 0, 2)}
                      </p>
                    </>}
                </span>
              </CardStat>
              <CardStat
                id={`av-credit`}
                label="Av. Credit"

                tooltip="Health Factor Tooltip"
              >
                <span className="w-full text-end md:text-start">
                  <p className="text-white text-xl">
                    $ {formatToFixedDecimals(((userAccountData[chainId].ltv * userAccountData[chainId].totalCollateral) - userAccountData[chainId].totalBorrowed) || 0, 2)}
                  </p>
                  {amountIn > 0 &&
                    <>
                      <p className={`text-sm text-white`}>
                        $ {formatToFixedDecimals(((newUserAccountData.ltv * newUserAccountData.totalCollateral) - newUserAccountData.totalBorrowed) || 0, 2)}
                      </p>
                    </>}
                </span>
              </CardStat>
              <CardStat
                id={`net-apy`}
                label="Net Apy"
                tooltip="Health Factor Tooltip"
              >
                <span className="w-full text-end md:text-start">
                  <p className="text-white text-xl">
                    {formatToFixedDecimals(userAccountData[chainId].netRate || 0, 2)} %
                  </p>
                  {amountIn > 0 &&
                    <>
                      <p className={`text-sm text-white`}>
                        {formatToFixedDecimals(newUserAccountData.netRate || 0, 2)} %
                      </p>
                    </>}
                </span>
              </CardStat>
              <CardStat
                id={`collateral`}
                label="Collateral"
                tooltip="Health Factor Tooltip"
              >
                <span className="w-full text-end md:text-start">
                  <p className="text-white text-xl">
                    $ {formatToFixedDecimals(userAccountData[chainId].totalCollateral || 0, 2)}
                  </p>
                  {amountIn > 0 &&
                    <>
                      <p className={`text-sm text-white`}>
                        $ {formatToFixedDecimals(newUserAccountData.totalCollateral || 0, 2)}
                      </p>
                    </>}
                </span>
              </CardStat>
              <CardStat
                id={`borrowed`}
                label="Borrowed"
                tooltip="Health Factor Tooltip"
              >
                <span className="w-full text-end md:text-start">
                  <p className="text-white text-xl">
                    $ {formatNumber(userAccountData[chainId].totalBorrowed || 0)}
                  </p>
                  {amountIn > 0 &&
                    <>
                      <p className={`text-sm text-white`}>
                        $ {formatNumber(newUserAccountData.totalBorrowed || 0)}
                      </p>
                    </>}
                </span>
              </CardStat>
              <CardStat
                id={`nlv`}
                label="Net Loan Value"
                tooltip="Health Factor Tooltip"
              >
                <span className="w-full text-end md:text-start">
                  <p className="text-white text-xl">
                    $ {formatNumber(userAccountData[chainId].netValue || 0)}
                  </p>
                  {amountIn > 0 &&
                    <>
                      <p className={`text-sm text-white`}>
                        $ {formatNumber(newUserAccountData.netValue || 0)}
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
                tooltip="Health Factor Tooltip"
              >
                <div className="w-full flex justify-end md:justify-start">
                  <span className="flex flex-row items-center">
                    <TokenIcon token={supplyToken} icon={supplyToken.logoURI} chainId={10} imageSize={"w-6 h-6 mb-0.5"} />
                    <p className="ml-2 mb-1.5 text-xl text-white">
                      {formatToFixedDecimals(supplyReserve.supplyRate || 0, 2)} %
                    </p>
                  </span>
                </div>
              </CardStat>
              <CardStat
                id={`borrow-apy`}
                label="Borrow Apy"
                tooltip="Health Factor Tooltip"
              >
                <div className="w-full flex justify-end md:justify-start">
                  <span className="flex flex-row items-center">
                    <TokenIcon token={borrowToken} icon={borrowToken.logoURI} chainId={10} imageSize={"w-6 h-6 mb-0.5"} />
                    <p className="ml-2 mb-1.5 text-xl text-white">
                      {formatToFixedDecimals(borrowReserve.borrowRate || 0, 2)} %
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
                tooltip="Health Factor Tooltip"
              />
              <CardStat
                id={`liq-threshold`}
                label="Liquidation Threshold"
                value={`${supplyReserve.liquidationThreshold.toFixed(2)} %`}
                tooltip="Health Factor Tooltip"
              />
              <CardStat
                id={`liq-penalty`}
                label="Liquidation Penalty"
                value={`${supplyReserve.liquidationPenalty.toFixed(2)} %`}
                tooltip="Health Factor Tooltip"
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