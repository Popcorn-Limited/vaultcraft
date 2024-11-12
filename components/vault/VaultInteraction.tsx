import { ZapProvider } from "@/lib/types";

import { VaultActionType, Token, VaultData, VaultAction as Action } from "@/lib/types";

import { useAtom } from "jotai";

import { Balance } from "@/lib/types";
import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { networthAtom, tokensAtom, tvlAtom, valueStorageAtom } from "@/lib/atoms";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { calcBalance } from "@/lib/utils/helpers";
import ActionSteps from "./ActionSteps";
import MainActionButton from "@/components/button/MainActionButton";
import { getDescription, handleVaultInteraction, updateStats } from "@/lib/vault/vaultHelpers";
import { getLabel } from "@/lib/vault/vaultHelpers";


interface VaultInteractionContainerProps {
  _inputToken: Token;
  _outputToken: Token;
  _inputBalance: Balance;
  zapProvider: ZapProvider;
  _action: Action;
  actionSeries: VaultActionType;
  actions: Action[];
  vaultData: VaultData;
  setShowModal: Function;
  callback?: Function
}

interface InteractionProps {
  inputToken: Token;
  outputToken: Token;
  inputBalance: Balance;
  zapProvider: ZapProvider;
  action: Action;
  vaultData: VaultData;
  interactionHooks: [(e?: any) => Promise<any>, (e?: any) => Promise<any>];
  setShowModal: Function;
}

export default function VaultInteractionContainer({
  _inputToken,
  _outputToken,
  zapProvider,
  _inputBalance,
  _action,
  actionSeries,
  actions,
  vaultData,
  setShowModal,
  callback
}: VaultInteractionContainerProps): JSX.Element {
  const publicClient = usePublicClient({ chainId: vaultData.chainId });

  const [inputToken, setInputToken] = useState<Token>(_inputToken)
  const [outputToken, setOutputToken] = useState<Token>(_outputToken)
  const [inputBalance, setInputBalance] = useState<Balance>(_inputBalance)
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
      if ([Action.deposit, Action.stake, Action.depositAndStake, Action.withdraw, Action.unstake, Action.unstakeAndWithdraw, Action.requestFulfillAndWithdraw, Action.unstakeAndRequestFulfillWithdraw].includes(action)) {
        updateStats(publicClient!, tokens[vaultData.chainId][vaultData.address], vaultData, vaults, setVaults, tvl, setTVL, tokens, networth, setNetworth)

        // Set asset as inputToken before zapApproving for zapOut
        if ([Action.withdraw, Action.unstakeAndWithdraw].includes(action) &&
          [VaultActionType.ZapWithdrawal, VaultActionType.ZapUnstakeAndWithdraw].includes(actionSeries)
        ) {
          setInputToken(tokens[vaultData.chainId][vaultData.asset])
        }
      }
      if (action === Action.zap) {
        // Set the `amount` as the output amount from zap        
        setInputBalance(calcBalance(
          tokens[vaultData.chainId][vaultData.asset].balance.value - valueStorage,
          tokens[vaultData.chainId][vaultData.asset].decimals,
          tokens[vaultData.chainId][vaultData.asset].price
        ))
        // Reset outputToken in case its deposit (reset doesnt matter on withdrawal since its the last action)
        setOutputToken(_outputToken)
        // Set to asset in case its deposit (reset doesnt matter on withdrawal since its the last action)
        setInputToken(tokens[vaultData.chainId][vaultData.asset])
      }

      // Set asset as outputToken before zapping in
      if (action === Action.zapApprove && [VaultActionType.ZapDeposit, VaultActionType.ZapDepositAndStake].includes(actionSeries)) {
        setOutputToken(tokens[vaultData.chainId][vaultData.asset])
        setValueStorage(tokens[vaultData.chainId][vaultData.asset].balance.value)
      }

      const nextStep = step + 1
      setAction(actions[nextStep])
      setStep(nextStep)
    } else {
      setAction(Action.done)
      callback && callback()
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
      inputBalance={inputBalance}
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

function Interaction({
  inputToken,
  outputToken,
  inputBalance,
  zapProvider,
  action,
  vaultData,
  interactionHooks,
  setShowModal
}: InteractionProps): JSX.Element {
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
    const success = await handleVaultInteraction(
      inputToken,
      outputToken,
      inputBalance.value,
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
      <p className="text-white text-start mb-2">{getDescription(inputToken, outputToken, Number(inputBalance.formatted), action, vaultData)}</p>
      <MainActionButton label={getLabel(action)} handleClick={handleMainAction} />
    </>
  )
}