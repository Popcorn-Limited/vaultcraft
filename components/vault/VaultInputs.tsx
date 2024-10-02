import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import MainActionButton from "@/components/button/MainActionButton"
import TabSelector from "@/components/common/TabSelector"
import InputTokenWithError from "@/components/input/InputTokenWithError"
import ActionSteps from "@/components/vault/ActionSteps"
import { networthAtom, tokensAtom, tvlAtom, valueStorageAtom } from "@/lib/atoms"
import { vaultsAtom } from "@/lib/atoms/vaults"
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts"
import { SmartVaultActionType, Token, VaultData, ZapProvider } from "@/lib/types"
import { formatNumber, safeRound } from "@/lib/utils/formatBigNumber"
import { handleSwitchChain, validateInput } from "@/lib/utils/helpers"
import { getZapProvider } from "@/lib/vault/zap"
import { ArrowDownIcon } from "@heroicons/react/24/outline"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAtom } from "jotai"
import { useState } from "react"
import { formatUnits, maxUint256, zeroAddress } from "viem"
import getVaultErrorMessage from "@/lib/vault/errorMessage";
import { Action, getDescription, getLabel, handleInteraction, selectActions, updateStats } from "@/lib/vault/helper";
import MainButtonGroup from "../common/MainButtonGroup";

export interface VaultInputsProps {
  vaultData: VaultData;
  tokenOptions: Token[];
  chainId: number;
  hideModal: () => void;
}

export default function VaultInputs({
  vaultData,
  tokenOptions,
  chainId,
  hideModal,
}: VaultInputsProps): JSX.Element {
  const asset = tokenOptions.find(t => t.address === vaultData.asset)
  const vault = tokenOptions.find(t => t.address === vaultData.vault)
  const gauge = tokenOptions.find(t => t.address === vaultData.gauge)

  vaultData.liquid = 5e6

  const { address: account, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const [tokens] = useAtom(tokensAtom)
  const [inputToken, setInputToken] = useState<Token>();
  const [outputToken, setOutputToken] = useState<Token>();

  const [steps, setSteps] = useState<Action[]>([]);
  const [action, setAction] = useState<SmartVaultActionType>(
    SmartVaultActionType.Deposit
  );

  const [inputBalance, setInputBalance] = useState<string>("0");
  const [isDeposit, setIsDeposit] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Zap Settings
  const [zapProvider, setZapProvider] = useState(ZapProvider.none)
  const [showModal, setShowModal] = useState<boolean>(false)

  function handleTokenSelect(input: Token, output: Token): void {
    setShowModal(false)
    setInputToken(input);
    setOutputToken(output);

    switch (input.address) {
      case asset?.address!:
        switch (output.address) {
          case asset?.address!:
            // error
            return;
          case vault?.address!:
            setIsDeposit(true);
            setAction(SmartVaultActionType.Deposit);
            setSteps(selectActions(SmartVaultActionType.Deposit));
            return;
          case gauge?.address:
            setIsDeposit(true);
            setAction(SmartVaultActionType.DepositAndStake);
            setSteps(
              selectActions(SmartVaultActionType.DepositAndStake)
            );
            return;
          default:
            // error
            return;
        }
      case vault?.address:
        switch (output.address) {
          case asset?.address!:
            setIsDeposit(false);
            setAction(SmartVaultActionType.Withdrawal);
            setSteps(selectActions(SmartVaultActionType.Withdrawal));
            return;
          case vault?.address!:
            // error
            return;
          case gauge?.address:
            setIsDeposit(true);
            setAction(SmartVaultActionType.Stake);
            setSteps(selectActions(SmartVaultActionType.Stake));
            return;
          default:
            setIsDeposit(false);
            setAction(SmartVaultActionType.ZapWithdrawal);
            setSteps(
              selectActions(SmartVaultActionType.ZapWithdrawal)
            );
            return;
        }
      case gauge?.address:
        switch (output.address) {
          case asset?.address!:
            setIsDeposit(false);
            setAction(SmartVaultActionType.UnstakeAndWithdraw);
            setSteps(
              selectActions(SmartVaultActionType.UnstakeAndWithdraw)
            );
            return;
          case vault?.address!:
            setIsDeposit(false);
            setAction(SmartVaultActionType.Unstake);
            setSteps(selectActions(SmartVaultActionType.Unstake));
            return;
          case gauge?.address:
            // error
            return;
          default:
            setIsDeposit(false);
            setAction(SmartVaultActionType.ZapUnstakeAndWithdraw);
            setSteps(
              selectActions(
                SmartVaultActionType.ZapUnstakeAndWithdraw
              )
            );
            return;
        }
      default:
        switch (output.address) {
          case asset?.address!:
            // error
            return;
          case vault?.address!:
            setIsDeposit(true);
            setAction(SmartVaultActionType.ZapDeposit);
            setSteps(selectActions(SmartVaultActionType.ZapDeposit));
            return;
          case gauge?.address:
            setIsDeposit(true);
            setAction(SmartVaultActionType.ZapDepositAndStake);
            setSteps(
              selectActions(SmartVaultActionType.ZapDepositAndStake)
            );
            return;
          default:
            // error
            return;
        }
    }
  }

  function switchTokens() {
    setInputBalance("0")
    setShowModal(false)

    if (isDeposit) {
      // Switch to Withdraw
      setInputToken(!!gauge ? gauge : vault);
      setOutputToken(undefined);
      setIsDeposit(false);
      const newAction = !!gauge
        ? SmartVaultActionType.UnstakeAndWithdraw
        : SmartVaultActionType.Withdrawal;
      setAction(newAction);
      setSteps(selectActions(newAction));
    } else {
      // Switch to Deposit
      setInputToken(undefined);
      setOutputToken(!!gauge ? gauge : vault);
      setIsDeposit(true);
      const newAction = !!gauge
        ? SmartVaultActionType.DepositAndStake
        : SmartVaultActionType.Deposit;
      setAction(newAction);
      setSteps(selectActions(newAction));
    }
  }

  function handleChangeInput(e: any) {
    if (!inputToken || !outputToken) return
    let value = e.currentTarget.value;
    value = validateInput(value).isValid ? value : "0"
    setInputBalance(value);
    setErrorMessage(getVaultErrorMessage(value, vaultData, inputToken, outputToken, isDeposit, action, tokens))
    setShowModal(false)
  }

  function handleMaxClick() {
    if (!inputToken) return;
    const stringBal = inputToken.balance.toLocaleString("fullwide", {
      useGrouping: false,
    });
    const rounded = safeRound(BigInt(stringBal), inputToken.decimals);
    const formatted = formatUnits(rounded, inputToken.decimals);
    handleChangeInput({ currentTarget: { value: formatted } });
  }

  async function findZapProvider(): Promise<boolean> {
    if (!inputToken || !outputToken || !asset || !account) return false
    const val = Number(inputBalance) * (10 ** inputToken.decimals)

    let newZapProvider = zapProvider
    if (newZapProvider === ZapProvider.none && [SmartVaultActionType.ZapDeposit, SmartVaultActionType.ZapDepositAndStake, SmartVaultActionType.ZapUnstakeAndWithdraw, SmartVaultActionType.ZapWithdrawal].includes(action)) {
      showLoadingToast("Searching for the best price...")
      if ([SmartVaultActionType.ZapDeposit, SmartVaultActionType.ZapDepositAndStake].includes(action)) {
        newZapProvider = await getZapProvider({ sellToken: inputToken, buyToken: asset, amount: val, chainId, account, feeRecipient: vaultData.metadata.feeRecipient })
      } else {
        newZapProvider = await getZapProvider({ sellToken: asset, buyToken: outputToken, amount: val, chainId, account, feeRecipient: vaultData.metadata.feeRecipient })
      }

      setZapProvider(newZapProvider)

      if (newZapProvider === ZapProvider.notFound) {
        showErrorToast("Zap not available. Please try a different token.")
        return false
      } else {
        showSuccessToast(`Using ${String(ZapProvider[newZapProvider])} for your zap`)
        return true
      }
    }
    return true
  }

  async function handlePreview() {
    const success = await findZapProvider();
    // Check if asset amount of the withdrawal is higher than withdrawal limit
    if (!isDeposit &&
      // calculate the amount of assets withdrawn
      ((Number(inputBalance) * Number(inputToken?.price)) / Number(tokens[vaultData.chainId][vaultData.asset].price) || 0)
      * (10 ** tokens[vaultData.chainId][vaultData.asset].decimals)
      > vaultData.liquid) {

      // Check if gauge exists
      if (vaultData.gauge && vaultData.gauge !== zeroAddress) {
        setAction(SmartVaultActionType.UnstakeAndRequestWithdrawal);
        setSteps(
          selectActions(SmartVaultActionType.UnstakeAndRequestWithdrawal)
        );
      } else {
        setAction(SmartVaultActionType.RequestWithdrawal);
        setSteps(
          selectActions(SmartVaultActionType.RequestWithdrawal)
        );
      }
    }
    if (success) setShowModal(true)
  }


  return <>
    <TabSelector
      className="mb-6"
      availableTabs={["Deposit", "Withdraw"]}
      activeTab={isDeposit ? "Deposit" : "Withdraw"}
      setActiveTab={switchTokens}
    />
    <InputTokenWithError
      captionText={isDeposit ? "Deposit Amount" : "Withdraw Amount"}
      onSelectToken={(option) =>
        handleTokenSelect(option, gauge ? gauge : vault!)
      }
      onMaxClick={handleMaxClick}
      chainId={chainId}
      value={inputBalance}
      onChange={handleChangeInput}
      selectedToken={inputToken}
      errorMessage={errorMessage}
      tokenList={tokenOptions.filter((token) =>
        gauge?.address
          ? token.address !== gauge?.address
          : token.address !== vault?.address
      )}
      allowSelection={isDeposit}
      disabled={!isDeposit && !outputToken}
      allowInput
    />
    {
      isDeposit ?
        <>
          {vaultData.depositLimit < maxUint256 &&
            <span className="flex flex-row items-center justify-between text-[#D7D7D7]">
              <p>Deposit Limit:</p>
              <p>{formatNumber(vaultData.depositLimit / (10 ** (asset?.decimals || 0)))} {asset?.symbol}</p>
            </span>
          }
        </>
        :
        <>
          {vaultData.liquid < vaultData.totalAssets &&
            <span className="flex flex-row items-center justify-between text-[#D7D7D7]">
              <p>Withdraw Limit:</p>
              <p>{formatNumber(vaultData.liquid / (10 ** (asset?.decimals || 0)))} {asset?.symbol}</p>
            </span>
          }
        </>
    }

    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-customGray500" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-customNeutral300 px-4">
          <ArrowDownIcon
            className="h-10 w-10 p-2 text-customGray500 border border-customGray500 rounded-full cursor-pointer hover:text-white hover:border-white"
            aria-hidden="true"
            onClick={switchTokens}
          />
        </span>
      </div>
    </div>

    <InputTokenWithError
      captionText={"Output Amount"}
      onSelectToken={(option) =>
        handleTokenSelect(gauge ? gauge : vault!, option)
      }
      onMaxClick={() => { }}
      chainId={chainId}
      value={
        (Number(inputBalance) * Number(inputToken?.price)) /
        Number(outputToken?.price) || 0
      }
      onChange={() => { }}
      selectedToken={outputToken}
      errorMessage={""}
      tokenList={tokenOptions.filter((token) =>
        gauge?.address
          ? token.address !== gauge?.address
          : token.address !== vault!.address
      )}
      allowSelection={!isDeposit}
      allowInput={false}
      disabled={isDeposit && !inputToken}
    />
    <div className="mt-4">
      <p className="text-white font-bold mb-2 text-start">Fee Breakdown</p>
      <div className="bg-customNeutral200 py-2 px-4 rounded-lg space-y-2">
        <span className="flex flex-row items-center justify-between text-white">
          <p>Deposit Fee</p>
          <p>{vaultData.fees.deposit / 1e16} %</p>
        </span>
        <span className="flex flex-row items-center justify-between text-white">
          <p>Withdrawal Fee</p>
          <p>{vaultData.fees.withdrawal / 1e16} %</p>
        </span>
        <span className="flex flex-row items-center justify-between text-white">
          <p>Management Fee</p>
          <p>{vaultData.fees.management / 1e16} %</p>
        </span>
        <span className="flex flex-row items-center justify-between text-white">
          <p>Performance Fee</p>
          <p>{vaultData.fees.performance / 1e16} %</p>
        </span>
      </div>
    </div>
    <div className="py-6">
      {  // Show an information banner if withdrawal > liquid assets 
        (!isDeposit &&
          // calculate the amount of assets withdrawn
          ((Number(inputBalance) * Number(inputToken?.price)) / Number(tokens[vaultData.chainId][vaultData.asset].price) || 0)
          * (10 ** tokens[vaultData.chainId][vaultData.asset].decimals)
          > vaultData.liquid) &&
        <div className="w-full bg-secondaryYellow bg-opacity-20 border border-secondaryYellow rounded-lg p-4 mb-4">
          <p className="text-secondaryYellow">
            You will request a withdrawal which can be claimed here later once the request has been processed
          </p>
        </div>
      }
      <MainButtonGroup
        label="Preview"
        mainAction={handlePreview}
        chainId={chainId}
        disabled={!account || !inputToken || inputBalance === "0" || showModal}
      />
    </div>

    {inputToken && outputToken && showModal &&
      <InteractionContainer
        _inputToken={inputToken}
        _outputToken={outputToken}
        zapProvider={zapProvider}
        _amount={Number(inputBalance) * (10 ** inputToken.decimals)}
        _action={steps[0]}
        actionSeries={action}
        actions={steps}
        vaultData={vaultData}
        setShowModal={setShowModal}
      />
    }
  </>
}

function InteractionContainer({ _inputToken, _outputToken, zapProvider, _amount, _action, actionSeries, actions, vaultData, setShowModal }:
  { _inputToken: Token, _outputToken: Token, _amount: number, zapProvider: ZapProvider, _action: Action, actionSeries: SmartVaultActionType, actions: Action[], vaultData: VaultData, setShowModal: Function }): JSX.Element {
  const publicClient = usePublicClient({ chainId: vaultData.chainId });

  const [inputToken, setInputToken] = useState<Token>(_inputToken)
  const [outputToken, setOutputToken] = useState<Token>(_outputToken)
  const [amount, setAmount] = useState<number>(_amount)
  const [valueStorage, setValueStorage] = useAtom(valueStorageAtom)
  const [action, setAction] = useState<Action>(_action)
  const [step, setStep] = useState<number>(0);

  const [tokens, setTokens] = useAtom(tokensAtom);
  const [vaults, setVaults] = useAtom(vaultsAtom);
  const [tvl, setTVL] = useAtom(tvlAtom);
  const [networth, setNetworth] = useAtom(networthAtom);

  async function interactionPreHook() {
    // if (action === Action.zap) {
    //   setValueStorage(tokens[vaultData.chainId][vaultData.asset].balance)
    // }
    return
  }

  async function interactionPostHook(success: boolean) {
    if (success) {
      if ([Action.deposit, Action.stake, Action.depositAndStake, Action.withdraw, Action.unstake, Action.unstakeAndWithdraw].includes(action)) {
        updateStats(publicClient!, tokens[vaultData.chainId][vaultData.address], vaultData, vaults, setVaults, tvl, setTVL, tokens, networth, setNetworth)

        // Set asset as inputToken before zapApproving for zapOut
        if ([Action.withdraw, Action.unstakeAndWithdraw].includes(action) &&
          [SmartVaultActionType.ZapWithdrawal, SmartVaultActionType.ZapUnstakeAndWithdraw].includes(actionSeries)
        ) {
          setInputToken(tokens[vaultData.chainId][vaultData.asset])
        }
      }
      if (action === Action.zap) {
        // Set the `amount` as the output amount from zap
        console.log({ balance: tokens[vaultData.chainId][vaultData.asset].balance, valueStorage })
        setAmount(tokens[vaultData.chainId][vaultData.asset].balance - valueStorage)
        // Reset outputToken in case its deposit (reset doesnt matter on withdrawal since its the last action)
        setOutputToken(_outputToken)
        // Set to asset in case its deposit (reset doesnt matter on withdrawal since its the last action)
        setInputToken(tokens[vaultData.chainId][vaultData.asset])
      }

      // Set asset as outputToken before zapping in
      if (action === Action.zapApprove && [SmartVaultActionType.ZapDeposit, SmartVaultActionType.ZapDepositAndStake].includes(actionSeries)) {
        setOutputToken(tokens[vaultData.chainId][vaultData.asset])
        setValueStorage(tokens[vaultData.chainId][vaultData.asset].balance)
      }

      const nextStep = step + 1
      setAction(actions[nextStep])
      setStep(nextStep)
    } else {
      setAction(Action.done)
    }
    return
  }

  return <div className="w-full flex flex-col mt-5">
    <Interaction
      inputToken={inputToken}
      outputToken={outputToken}
      zapProvider={zapProvider}
      vaultData={vaultData}
      action={action}
      amount={amount}
      interactionHooks={[interactionPreHook, interactionPostHook]}
      setShowModal={setShowModal}
    />
    <div className="mt-6">
      <ActionSteps
        steps={actions.slice(0, -1).map((a, i) => {
          const isError = action === Action.done && step < actions.length
          return {
            step: i + 1,
            label: getLabel(a),
            success: i < step,
            error: isError,
            loading: !isError && i === step,
            updateBalance: false
          }
        })}
        stepCounter={step}
      />
    </div>
  </div>
}

function Interaction({ inputToken, outputToken, amount, zapProvider, action, vaultData, interactionHooks, setShowModal }:
  { inputToken: Token, outputToken: Token, amount: number, zapProvider: ZapProvider, action: Action, vaultData: VaultData, interactionHooks: [(e?: any) => Promise<any>, (e?: any) => Promise<any>], setShowModal: Function }): JSX.Element {
  const [preHook, postHook] = interactionHooks
  const publicClient = usePublicClient({ chainId: vaultData.chainId });
  const { data: walletClient } = useWalletClient();
  const { address: account, chain } = useAccount();
  const [tokens, setTokens] = useAtom(tokensAtom);

  async function handleMainAction() {
    if (!account) return
    if (action === Action.done) setShowModal(false)

    await preHook()

    const clients = { publicClient: publicClient!, walletClient: walletClient! }
    const success = await handleInteraction(
      inputToken,
      outputToken,
      amount,
      action,
      vaultData,
      tokens[vaultData.chainId][vaultData.asset],
      tokens[vaultData.chainId][vaultData.address],
      account,
      zapProvider,
      clients,
      [tokens, setTokens]
    )()
    await postHook(success)
  }

  return (
    <>
      <p className="text-white text-start text-2xl font-bold leading-none mb-1">{getLabel(action)}</p>
      <p className="text-white text-start mb-2">{getDescription(inputToken, outputToken, amount, action, vaultData)}</p>
      <MainActionButton label={getLabel(action)} handleClick={handleMainAction} />
    </>
  )
}