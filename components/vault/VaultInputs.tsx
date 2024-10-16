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
import { handleAllowance } from "@/lib/approve"
import { Networth, networthAtom, tokensAtom, TVL, tvlAtom, valueStorageAtom } from "@/lib/atoms"
import { vaultsAtom } from "@/lib/atoms/vaults"
import { VaultRouterByChain } from "@/lib/constants"
import { gaugeDeposit, gaugeWithdraw } from "@/lib/gauges/interactions"
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts"
import { Balance, Clients, SmartVaultActionType, Token, TokenByAddress, TokenType, VaultData, ZapProvider } from "@/lib/types"
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors"
import { EMPTY_BALANCE, formatBalance, formatBalanceUSD, NumberFormatter } from "@/lib/utils/helpers"
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultUnstakeAndWithdraw } from "@/lib/vault/interactions"
import zap, { getZapProvider, handleZapAllowance } from "@/lib/vault/zap"
import { ArrowDownIcon } from "@heroicons/react/24/outline"
import { useAtom } from "jotai"
import { useState } from "react"
import { Address, erc20Abi, formatUnits, maxUint256, parseUnits, PublicClient } from "viem"
import getVaultErrorMessage from "@/lib/vault/errorMessage";
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

  const { address: account, chain } = useAccount();
  const [tokens] = useAtom(tokensAtom)
  const [inputToken, setInputToken] = useState<Token>();
  const [outputToken, setOutputToken] = useState<Token>();

  const [steps, setSteps] = useState<Action[]>([]);
  const [action, setAction] = useState<SmartVaultActionType>(
    SmartVaultActionType.Deposit
  );

  const [inputBalance, setInputBalance] = useState<Balance>(EMPTY_BALANCE);
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
    setInputBalance(EMPTY_BALANCE)
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

    const [integers, decimals] = String(value).split('.');
    let inputAmt = value;

    // if precision is more than token decimal, cut it
    if (decimals?.length > inputToken.decimals) {
      inputAmt = `${integers}.${decimals.slice(0, inputToken.decimals)}`;
    }

    // covert string amt to bigint
    const newAmt = parseUnits(inputAmt, inputToken.decimals)

    setInputBalance({ value: newAmt, formatted: inputAmt, formattedUSD: String(Number(inputAmt) * (inputToken.price || 0)) });
    setErrorMessage(getVaultErrorMessage(value, vaultData, inputToken, outputToken, isDeposit, action, tokens))
    setShowModal(false)
  }

  function handleMaxClick() {
    if (!inputToken) return;
    handleChangeInput({ currentTarget: { value: inputToken.balance.formatted } });
  }

  async function findZapProvider(): Promise<boolean> {
    if (!inputToken || !outputToken || !asset || !account) return false
    const val = Number(inputBalance.value)

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
      value={inputBalance.formatted}
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
            <span
              className="flex flex-row items-center justify-between text-customGray100 hover:text-customGray200 cursor-pointer"
              onClick={() => handleChangeInput({ currentTarget: { value: formatBalance(vaultData.depositLimit, asset?.decimals || 0) } })}
            >
              <p>Deposit Limit:</p>
              <p>{formatBalance(vaultData.depositLimit, asset?.decimals || 0)} {asset?.symbol}</p>
            </span>
          }
        </>
        :
        <>
          {vaultData.withdrawalLimit < vaultData.totalSupply &&
            <span
              className="flex flex-row items-center justify-between text-customGray100 hover:text-customGray200 cursor-pointer"
              onClick={() => handleChangeInput({ currentTarget: { value: formatBalance(vaultData.withdrawalLimit, vault?.decimals || 0) } })}
            >
              <p>Withdraw Limit:</p>
              <p>{vault ? formatBalance(vaultData.withdrawalLimit, vault.decimals) : "0"} {vault?.symbol}</p>
            </span>
          }
        </>
    }

    <div className="relative mt-4">
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
        (Number(inputBalance.formattedUSD) /
          (outputToken?.price || 0)) || "0"
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
          <p>{formatUnits(vaultData.fees.deposit, 16)} %</p>
        </span>
        <span className="flex flex-row items-center justify-between text-white">
          <p>Withdrawal Fee</p>
          <p>{formatUnits(vaultData.fees.withdrawal, 16)} %</p>
        </span>
        <span className="flex flex-row items-center justify-between text-white">
          <p>Management Fee</p>
          <p>{formatUnits(vaultData.fees.management, 16)} %</p>
        </span>
        <span className="flex flex-row items-center justify-between text-white">
          <p>Performance Fee</p>
          <p>{formatUnits(vaultData.fees.performance, 16)} %</p>
        </span>
      </div>
    </div>

    <div className="py-6">
      {
        vaultData.address === "0xCe3Ac66020555EdcE9b54dAD5EC1c35E0478B887" &&
        !isDeposit &&
        inputBalance.value > vaultData.withdrawalLimit && // Input > withdrawalLimit
        <div className="w-full bg-secondaryYellow bg-opacity-20 border border-secondaryYellow rounded-lg p-4 mb-4">
          <p className="text-secondaryYellow">
            At this time, {NumberFormatter.format(100 - (Number(vaultData.liquid) / Number(vaultData.totalAssets) * 100))} % of the funds are being utilized in the LBTC Smart Vault&apos;s strategies. You cannot withdraw more than the specified withdrawal limit of {formatBalance(vaultData.withdrawalLimit, vault?.decimals || 0)} {vault?.symbol}. Funds available for withdrawal will be released once a day at 18:00 CET. Please check back later. In the near future, withdrawals will be automated with withdrawal queues. Please log a ticket on Discord if you need more help:{" "}
            <a
              href="https://discord.com/channels/810280562626658334/1178741499605815448"
              target="_blank"
              className="text-secondaryBlue">
              VaultCraft Discord Support
            </a>
          </p>
        </div>
      }
      <MainButtonGroup
        label="Preview"
        mainAction={handlePreview}
        chainId={vaultData.chainId}
        disabled={
          (!isDeposit
            && vaultData.address === "0xCe3Ac66020555EdcE9b54dAD5EC1c35E0478B887"
            && inputBalance.value > vaultData.withdrawalLimit // Input > withdrawalLimit
          ) ||
          !account || !inputToken || inputBalance.formatted === "0" ||  // Not connected / selected properly
          showModal // Already in transactions
        }
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
        setAmount(Number(
          formatBalance(
            tokens[vaultData.chainId][vaultData.asset].balance.value - valueStorage,
            tokens[vaultData.chainId][vaultData.asset].decimals
          )))
        // Reset outputToken in case its deposit (reset doesnt matter on withdrawal since its the last action)
        setOutputToken(_outputToken)
        // Set to asset in case its deposit (reset doesnt matter on withdrawal since its the last action)
        setInputToken(tokens[vaultData.chainId][vaultData.asset])
      }

      // Set asset as outputToken before zapping in
      if (action === Action.zapApprove && [SmartVaultActionType.ZapDeposit, SmartVaultActionType.ZapDepositAndStake].includes(actionSeries)) {
        setOutputToken(tokens[vaultData.chainId][vaultData.asset])
        setValueStorage(tokens[vaultData.chainId][vaultData.asset].balance.value)
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

function getDescription(inputToken: Token, outputToken: Token, amount: number, action: Action, vaultData: VaultData) {
  const val = formatBalance(amount, inputToken.decimals)
  switch (action) {
    case Action.depositApprove:
      return `Approving ${val} ${inputToken.symbol} for Vault deposit.`
    case Action.stakeApprove:
      return `Approving ${val} ${inputToken.symbol} for Vault staking.`
    case Action.depositAndStakeApprove:
      return `Approving ${val} ${inputToken.symbol} for Vault deposit and staking.`
    case Action.unstakeAndWithdrawApprove:
      return `Approving ${val} ${inputToken.symbol} for Vault unstake and withdrawing.`
    case Action.zapApprove:
      return `Approving ${val} ${inputToken.symbol} for zapping.`
    case Action.deposit:
      return `Depositing ${val} ${inputToken.symbol} into the Vault.`
    case Action.stake:
      return `Staking ${val} ${inputToken.symbol} into the Gauge.`
    case Action.depositAndStake:
      return `Deposit and staking ${val} ${inputToken.symbol} into the Vault.`
    case Action.withdraw:
      return `Withdrawing ${val} ${inputToken.symbol}.`
    case Action.unstake:
      return `Unstaking ${val} ${inputToken.symbol}.`
    case Action.unstakeAndWithdraw:
      return `Withdraw and unstaking ${val} ${inputToken.symbol}.`
    case Action.zap:
      return `Selling ${val} ${inputToken.symbol} for ${outputToken.symbol}.`
    case Action.done:
      return ""
  }
}

function getLabel(action: Action) {
  switch (action) {
    case Action.depositApprove:
    case Action.stakeApprove:
    case Action.depositAndStakeApprove:
    case Action.unstakeAndWithdrawApprove:
    case Action.zapApprove:
      return "Approve"
    case Action.deposit:
      return "Deposit"
    case Action.stake:
      return "Stake"
    case Action.depositAndStake:
      return "Deposit"
    case Action.withdraw:
      return "Withdraw"
    case Action.unstake:
      return "Unstake"
    case Action.unstakeAndWithdraw:
      return "Withdraw"
    case Action.zap:
      return "Zap"
    case Action.done:
      return "Done"
  }
}


function selectActions(action: SmartVaultActionType) {
  switch (action) {
    case SmartVaultActionType.Deposit:
      return [
        Action.depositApprove,
        Action.deposit,
        Action.done
      ]
    case SmartVaultActionType.ZapDeposit:
      return [
        Action.zapApprove,
        Action.zap,
        Action.depositApprove,
        Action.deposit,
        Action.done
      ]
    case SmartVaultActionType.Stake:
      return [
        Action.stakeApprove,
        Action.stake,
        Action.done
      ]
    case SmartVaultActionType.DepositAndStake:
      return [
        Action.depositAndStakeApprove,
        Action.depositAndStake,
        Action.done
      ]
    case SmartVaultActionType.ZapDepositAndStake:
      return [
        Action.zapApprove,
        Action.zap,
        Action.depositAndStakeApprove,
        Action.depositAndStake,
        Action.done
      ]
    case SmartVaultActionType.Withdrawal:
      return [
        Action.withdraw,
        Action.done
      ]
    case SmartVaultActionType.ZapWithdrawal:
      return [
        Action.withdraw,
        Action.zapApprove,
        Action.zap,
        Action.done
      ]
    case SmartVaultActionType.Unstake:
      return [
        Action.unstake,
        Action.done
      ]
    case SmartVaultActionType.UnstakeAndWithdraw:
      return [
        Action.unstakeAndWithdrawApprove,
        Action.unstakeAndWithdraw,
        Action.done
      ]
    case SmartVaultActionType.ZapUnstakeAndWithdraw:
      return [
        Action.unstakeAndWithdrawApprove,
        Action.unstakeAndWithdraw,
        Action.zapApprove,
        Action.zap,
        Action.done
      ]
  }
}

function handleInteraction(
  inputToken: Token,
  outputToken: Token,
  amount: number,
  action: Action,
  vaultData: VaultData,
  asset: Token,
  vault: Token,
  account: Address,
  zapProvider: ZapProvider,
  clients: Clients,
  tokensAtom: [{ [key: number]: TokenByAddress }, Function]
) {
  switch (action) {
    case Action.depositApprove:
      return () =>
        handleAllowance({
          token: inputToken.address,
          amount,
          account,
          spender: vaultData.address,
          clients,
        });
    case Action.stakeApprove:
      return () =>
        handleAllowance({
          token: inputToken.address,
          amount,
          account,
          spender: vaultData.gauge!,
          clients,
        });
    case Action.depositAndStakeApprove:
    case Action.unstakeAndWithdrawApprove:
      return () =>
        handleAllowance({
          token: inputToken.address,
          amount,
          account,
          spender: VaultRouterByChain[vaultData.chainId],
          clients,
        });
    case Action.zapApprove:
      return () => handleZapAllowance({
        token: inputToken.address,
        amount,
        account,
        zapProvider,
        clients
      })
    case Action.deposit:
      return () =>
        vaultDeposit({
          chainId: vaultData.chainId,
          vaultData,
          asset: inputToken,
          vault: outputToken,
          account,
          amount,
          clients,
          fireEvent: undefined,
          referral: undefined,
          tokensAtom
        });
    case Action.stake:
      return () =>
        gaugeDeposit({
          vaultData,
          account,
          amount,
          clients,
          tokensAtom
        });
    case Action.depositAndStake:
      return () => vaultDepositAndStake({
        chainId: vaultData.chainId,
        router: VaultRouterByChain[vaultData.chainId],
        vaultData,
        asset,
        vault,
        account,
        amount,
        clients,
        fireEvent: undefined,
        referral: undefined,
        tokensAtom
      })
    case Action.withdraw:
      return () =>
        vaultRedeem({
          chainId: vaultData.chainId,
          vaultData,
          asset,
          vault,
          account,
          amount,
          clients,
          fireEvent: undefined,
          referral: undefined,
          tokensAtom
        });
    case Action.unstake:
      return () =>
        gaugeWithdraw({
          vaultData,
          account,
          amount,
          clients,
          tokensAtom
        });
    case Action.unstakeAndWithdraw:
      return () => vaultUnstakeAndWithdraw({
        chainId: vaultData.chainId,
        router: VaultRouterByChain[vaultData.chainId],
        vaultData,
        asset,
        vault,
        account,
        amount,
        clients,
        fireEvent: undefined,
        referral: undefined,
        tokensAtom
      })
    case Action.zap:
      return () => zap({
        chainId: vaultData.chainId,
        sellToken: inputToken,
        buyToken: outputToken,
        amount,
        account,
        zapProvider,
        slippage: 100,
        tradeTimeout: 300,
        clients,
        tokensAtom
      })
    case Action.done:
      return () => { }
  }
}

async function updateStats(
  publicClient: PublicClient,
  vault: Token,
  vaultData: VaultData,
  vaults: { [key: number]: VaultData[] },
  setVaults: Function,
  tvl: TVL,
  setTVL: Function,
  tokens: { [key: number]: TokenByAddress },
  networth: Networth,
  setNetworth: Function
) {
  const newSupply = await publicClient?.readContract({
    address: vaultData.address,
    abi: erc20Abi,
    functionName: "totalSupply"
  })
  const index = vaults[vaultData.chainId].findIndex(v => v.address === vaultData.address)
  const newNetworkVaults = [...vaults[vaultData.chainId]]
  newNetworkVaults[index] = {
    ...vaultData,
    totalSupply: newSupply,
    tvl: Number(formatBalanceUSD(newSupply, vault.decimals, vault.price))
  }
  const newVaults = { ...vaults, [vaultData.chainId]: newNetworkVaults }

  setVaults(newVaults)

  const vaultTVL = SUPPORTED_NETWORKS.map(chain => newVaults[chain.id]).flat().reduce((a, b) => a + b.tvl, 0)
  setTVL({
    vault: vaultTVL,
    lockVault: tvl.lockVault,
    stake: tvl.stake,
    total: vaultTVL + tvl.lockVault + tvl.stake
  });

  const vaultNetworth = SUPPORTED_NETWORKS.map(chain =>
    Object.values(tokens[chain.id])).flat().filter(t => t.type === TokenType.Vault || t.type === TokenType.Gauge)
    .reduce((a, b) => a + Number(b.balance.formattedUSD), 0)
  const assetNetworth = SUPPORTED_NETWORKS.map(chain =>
    Object.values(tokens[chain.id])).flat().filter(t => t.type === TokenType.Asset)
    .reduce((a, b) => a + Number(b.balance.formattedUSD), 0)

  setNetworth({
    vault: vaultNetworth,
    lockVault: networth.lockVault,
    wallet: assetNetworth,
    stake: networth.stake,
    total: vaultNetworth + assetNetworth + networth.lockVault + networth.stake
  })
}

enum Action {
  depositApprove,
  stakeApprove,
  depositAndStakeApprove,
  unstakeAndWithdrawApprove,
  zapApprove,
  deposit,
  stake,
  depositAndStake,
  withdraw,
  unstake,
  unstakeAndWithdraw,
  zap,
  done
}
