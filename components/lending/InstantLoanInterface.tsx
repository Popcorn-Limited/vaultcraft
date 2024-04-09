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
import { EMPTY_USER_ACCOUNT_DATA, aaveAccountDataAtom, aaveReserveDataAtom } from "@/lib/atoms/lending";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ActionStep, getAaveActionSteps } from "@/lib/getActionSteps";
import handleAaveInteraction, { AaveActionType } from "@/lib/external/aave/handleAaveInteractions";
import { calcUserAccountData, fetchAaveData, getHealthFactorColor } from "@/lib/external/aave";
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

  const [tokens, setTokens] = useAtom(tokensAtom)

  const [reserveData, setAaveReserveData] = useAtom(aaveReserveDataAtom)
  const [aaveAccountData, setAaveAccountData] = useAtom(aaveAccountDataAtom)
  const [newUserAccountData, setNewUserAccountData] = useState<UserAccountData>(EMPTY_USER_ACCOUNT_DATA)

  const [assetBorrowable, setAssetBorrowable] = useState(false);
  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();

  const [tokenList, setTokenList] = useState<Token[]>([])
  const [tokenIn, setTokenIn] = useState<Token | null>(null)
  const [tokenMid, setTokenMid] = useState<Token | null>(null)
  const [tokenOut, setTokenOut] = useState<Token | null>(null)

  useEffect(() => {
    if (
      Object.keys(reserveData).length > 0 &&
      Object.keys(vaultData).length > 0 &&
      Object.keys(tokens).length > 0 &&
      reserveData[vaultData.chainId]?.length > 0
    ) {
      // Set Basic Tokens
      setAsset(tokens[vaultData.chainId][vaultData.asset])
      setVault(tokens[vaultData.chainId][vaultData.vault])

      if (vaultData.gauge) {
        setGauge(tokens[vaultData.chainId][vaultData.gauge])
        setTokenOut(tokens[vaultData.chainId][vaultData.gauge])
      } else {
        setTokenOut(tokens[vaultData.chainId][vaultData.vault])
      }

      const assetReserveData = reserveData[vaultData.chainId].find(e => e.asset === vaultData.asset)
      setAssetBorrowable(!!assetReserveData)

      const sorted = reserveData[vaultData.chainId].sort((a, b) => a.balance - b.balance)
      setTokenList(sorted.map(e => tokens[vaultData.chainId][e.asset]))

      setTokenIn(tokens[vaultData.chainId][reserveData[vaultData.chainId].sort((a, b) => b.balanceValue - a.balanceValue)[0].asset])

      setTokenMid(!!assetReserveData
        ? tokens[vaultData.chainId][vaultData.asset]
        : tokens[vaultData.chainId][sorted[0].asset])

      setLtv(!!assetReserveData
        ? assetReserveData.ltv
        : sorted[0].ltv
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
      setTokenMid(assetBorrowable
        ? tokens[vaultData.chainId][vaultData.asset]
        : tokens[vaultData.chainId][sorted[0].asset]
      )
      setTokenOut(tokens[vaultData.chainId][reserveData[vaultData.chainId][0].asset])

      // Default repayment rate is 100%
      setRatio(100);
    } else {
      // Switch to "Deposit"
      setTokenIn(tokens[vaultData.chainId][reserveData[vaultData.chainId].sort((a, b) => b.balanceValue - a.balanceValue)[0].asset])
      setTokenOut(gauge ? gauge! : vault!)

      const sorted = reserveData[vaultData.chainId].sort((a, b) => a.balance - b.balance)
      setTokenMid(assetBorrowable
        ? tokens[vaultData.chainId][vaultData.asset]
        : tokens[vaultData.chainId][sorted[0].asset]
      )

      if (!assetBorrowable) {
        setLtv(sorted[0].ltv)
      }

      setRatio(0);
    }

    setIsDeposit(!isDeposit);
    setAmountIn("0");
    setAmountMid("0");
    setAmountOut("0");
    setStepCounter(0);
  }

  function handleTokenSelect(input: Token, type: "in" | "mid" | "out") {
    handleChangeInput({ currentTarget: { value: 0 } })

    switch (type) {
      case "in":
        setTokenIn(input)
        return
      case "mid":
        setTokenMid(input)
        setLtv(reserveData[vaultData.chainId].find(e => e.asset === input.address)?.ltv!)
        return
      case "out":
        setTokenOut(input)
      default:
        return
    }
  }

  const [amountIn, setAmountIn] = useState<string>("0");
  const [amountMid, setAmountMid] = useState<string>("0");
  const [amountOut, setAmountOut] = useState<string>("0");

  const [oldAmountIn, setOldAmountIn] = useState<number>(0);
  const [oldAmountMid, setOldAmountMid] = useState<number>(0);

  const [ltv, setLtv] = useState<number>(0);
  const [ratio, setRatio] = useState<number>(0);

  function handleChangeInput(e: any) {
    if (!tokenIn || !tokenMid || !tokenOut) return

    let valueIn = e.currentTarget.value
    valueIn = validateInput(valueIn).isValid ? valueIn : "0"

    let valueMid = ((Number(valueIn) * tokenIn.price) * (ratio / 100)) / tokenMid.price;
    const reserveTokenData = reserveData[vaultData.chainId].find(d => d.asset === tokenMid?.address)
    if (!isDeposit) {
      if (reserveTokenData) {
        valueMid = valueMid > reserveTokenData.borrowAmount ? reserveTokenData.borrowAmount : valueMid;
      }
    }

    const valueOut = (valueMid * tokenMid.price) / tokenOut.price

    setAmountIn(valueIn)
    setAmountMid(String(valueMid))
    setAmountOut(String(valueOut))

    // calc preview
    const newReserveData = [...reserveData[vaultData.chainId]]
    const previewAmountIn = Number(valueIn) - oldAmountIn
    const previewAmountMid = Number(valueMid) - oldAmountMid

    setOldAmountIn(Number(valueIn))
    setOldAmountMid(valueMid)

    const userLtv = aaveAccountData[vaultData.chainId].ltv > 0
      // user has an account already 
      ? aaveAccountData[vaultData.chainId].ltv
      // use the borrow token ltv
      : reserveTokenData?.ltv

    if (isDeposit) {
      newReserveData[newReserveData.findIndex(e => e.asset === tokenIn.address)].supplyAmount += previewAmountIn
      newReserveData[newReserveData.findIndex(e => e.asset === tokenMid.address)].borrowAmount += previewAmountMid

      setNewUserAccountData({ ...calcUserAccountData(newReserveData, tokens[vaultData.chainId], userLtv!) })

    } else {
      newReserveData[newReserveData.findIndex(e => e.asset === tokenMid.address)].borrowAmount -= previewAmountMid

      setNewUserAccountData(calcUserAccountData(newReserveData, tokens[vaultData.chainId], userLtv!))
    }
  };

  function handleSlider(e: any) {
    setRatio(e as number)
    handleChangeInput({ currentTarget: { value: amountIn } })
  }

  function handleMaxClick() {
    if (!tokenIn) return
    const stringBal = tokenIn.balance.toLocaleString("fullwide", { useGrouping: false })
    const rounded = safeRound(BigInt(stringBal), tokenIn.decimals)
    const formatted = formatUnits(rounded, tokenIn.decimals)
    handleChangeInput({ currentTarget: { value: formatted } })
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
                onSelectToken={(t) => handleTokenSelect(t, "in")}
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
                onSelectToken={(t) => handleTokenSelect(t, "mid")}
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
                  {isDeposit ? `Loan To Value Ratio: ${ratio} / ${ltv}` : `Repayment Percentage: ${ratio} / 100`} %
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
                      value={ratio}
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
                onSelectToken={(t) => handleTokenSelect(t, "out")}
                onMaxClick={() => { }}
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
                <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-4 text-start">
                  <CardStat
                    id={`instant-health-factor`}
                    label="Health Factor"
                    tooltip="Health Factor Tooltip"
                  >
                    <span className="w-full text-end md:text-start">
                      <p className="text-white text-xl">
                        {formatToFixedDecimals(aaveAccountData[vaultData.chainId].healthFactor || 0, 2)}
                      </p>
                      {Number(amountMid) > 0 &&
                        <>
                          <p className={`text-sm ${getHealthFactorColor("text", newUserAccountData.healthFactor)}`}>
                            {formatToFixedDecimals(newUserAccountData.healthFactor || 0, 2)}
                          </p>
                        </>}
                    </span>
                  </CardStat>
                  <CardStat
                    id={`instant-net-apy`}
                    label="Net Apy"
                    tooltip="Health Factor Tooltip"
                  >
                    <span className="w-full text-end md:text-start">
                      <p className="text-white text-xl">
                        {formatToFixedDecimals(aaveAccountData[vaultData.chainId].netRate || 0, 2)} %
                      </p>
                      {Number(amountMid) > 0 &&
                        <>
                          <p className={`text-sm text-white`}>
                            {formatToFixedDecimals(newUserAccountData.netRate || 0, 2)} %
                          </p>
                        </>}
                    </span>
                  </CardStat>
                  <CardStat
                    id={`instant-nlv`}
                    label="Net Loan Value"
                    tooltip="Health Factor Tooltip"
                  >
                    <span className="w-full text-end md:text-start">
                      <p className="text-white text-xl">
                        $ {formatNumber(aaveAccountData[vaultData.chainId].netValue || 0)}
                      </p>
                      {Number(amountMid) > 0 &&
                        <>
                          <p className={`text-sm text-white`}>
                            $ {formatNumber(newUserAccountData.netValue || 0)}
                          </p>
                        </>}
                    </span>
                  </CardStat>
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