import TabSelector from "@/components/common/TabSelector";
import { masaAtom } from "@/lib/atoms/sdk";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import ActionSteps from "../ActionSteps";
import MainActionButton from "@/components/button/MainActionButton";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import { useEffect, useState } from "react";
import { LockVaultActionType, LockVaultData, Token } from "@/lib/types";
import Claim from "./Claim";
import { getAddress, isAddress } from "viem";
import handleVaultInteraction from "@/lib/vault/lockVault/handleVaultInteraction";
import { ActionStep, getLockVaultActionSteps } from "@/lib/getActionSteps";

interface VaultInteractionProps {
  vaultData: LockVaultData;
  tokenOptions: Token[];
  hideModal: () => void;
  mutateTokenBalance: () => void;
  depositDisabled?: boolean;
}

export default function VaultInteraction({ vaultData, tokenOptions, hideModal, mutateTokenBalance, depositDisabled = false }: VaultInteractionProps): JSX.Element {
  const { query } = useRouter()
  const [masaSdk,] = useAtom(masaAtom)

  const { address: account } = useAccount()
  const publicClient = usePublicClient({ chainId: vaultData.chainId });
  const { data: walletClient } = useWalletClient()
  const { chain } = useNetwork();

  const { switchNetworkAsync } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const [inputToken, setInputToken] = useState<Token>(vaultData.asset)
  const [outputToken, setOutputToken] = useState<Token>(vaultData.vault)

  const [inputBalance, setInputBalance] = useState<string>("0");
  const [days, setDays] = useState<string>(String(vaultData.lock.daysToUnlock > 0 ? vaultData.lock.daysToUnlock : "7"));

  const isDeposit = vaultData.lock.unlockTime === 0 || vaultData.lock.daysToUnlock > 0

  const [availableTabs, setAvailableTabs] = useState<string[]>(depositDisabled ? ["Deposit"] : ["Deposit", "Claim"])
  const [activeTab, setActiveTab] = useState<string>("Deposit")

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>([])
  const [action, setAction] = useState<LockVaultActionType>(LockVaultActionType.Deposit)

  useEffect(() => {
    let newActiveTabs = [isDeposit ? "Deposit" : "Withdraw"]
    if (!depositDisabled) newActiveTabs.push("Claim")
    setAvailableTabs(newActiveTabs)
    setActiveTab(isDeposit ? "Deposit" : "Withdraw")

    if (isDeposit) {
      const newAction = vaultData.lock.unlockTime === 0 ? LockVaultActionType.Deposit : LockVaultActionType.IncreaseAmount
      setAction(newAction)
      setSteps(getLockVaultActionSteps(newAction))
      setInputToken(vaultData.asset)
      setOutputToken(vaultData.vault)
    } else {
      setAction(LockVaultActionType.Withdrawal)
      setSteps(getLockVaultActionSteps(LockVaultActionType.Withdrawal))
      setInputBalance(String(vaultData.lock.amount / (10 ** vaultData.vault.decimals)))
      setInputToken(vaultData.vault)
      setOutputToken(vaultData.asset)
    }
  }, [])

  function switchActiveTab(tab: string) {
    setStepCounter(0)
    if (tab === "Claim") {
      setActiveTab(isDeposit ? "Deposit" : "Withdraw")
      if (isDeposit) {
        const newAction = vaultData.lock.unlockTime === 0 ? LockVaultActionType.Deposit : LockVaultActionType.IncreaseAmount
        setAction(newAction)
        setSteps(getLockVaultActionSteps(newAction))
        setInputBalance("0")
        setInputToken(vaultData.asset)
        setOutputToken(vaultData.vault)
      } else {
        setAction(LockVaultActionType.Withdrawal)
        setSteps(getLockVaultActionSteps(LockVaultActionType.Withdrawal))
        setInputBalance(String(vaultData.lock.amount / (10 ** vaultData.vault.decimals)))
        setInputToken(vaultData.vault)
        setOutputToken(vaultData.asset)
      }
    } else {
      setActiveTab("Claim")
      setAction(LockVaultActionType.Claim)
      setSteps(getLockVaultActionSteps(LockVaultActionType.Claim))
      setInputBalance(String("1"))
    }
  }

  async function handleMainAction() {
    const val = Number(inputBalance)
    if (val === 0 || !vaultData || !account || !walletClient) return;
    if (action === LockVaultActionType.Deposit && Number(days) === 0) return;

    if (chain?.id !== vaultData.chainId) {
      try {
        await switchNetworkAsync?.(vaultData.chainId);
      } catch (error) {
        return
      }
    }

    const stepsCopy = [...steps]
    const currentStep = stepsCopy[stepCounter]
    currentStep.loading = true
    setSteps(stepsCopy)

    const vaultInteraction = await handleVaultInteraction({
      amount: (val * (10 ** inputToken.decimals)),
      days: Number(days),
      action,
      stepCounter,
      chainId: vaultData.chainId,
      inputToken,
      outputToken,
      vaultData,
      account,
      slippage: 100, // In BPS 0 - 10_000
      tradeTimeout: 300,
      clients: { publicClient, walletClient },
      fireEvent: masaSdk?.fireEvent,
      referral: !!query?.ref && isAddress(query.ref as string) ? getAddress(query.ref as string) : undefined
    })
    const success = await vaultInteraction()

    currentStep.loading = false
    currentStep.success = success;
    currentStep.error = !success;
    const newStepCounter = stepCounter + 1
    setSteps(stepsCopy)
    setStepCounter(newStepCounter)

    if (newStepCounter === steps.length) mutateTokenBalance()
  }

  function handleTokenSelect(input: Token, output: Token): void {
    setInputToken(input);
    setOutputToken(output);
    switch (input.address) {
      case vaultData.asset.address:
        if (action === LockVaultActionType.Claim) {
          setAction(LockVaultActionType.Claim)
          setSteps(getLockVaultActionSteps(LockVaultActionType.Claim))
        } else {
          const newAction = vaultData.lock.unlockTime === 0 ? LockVaultActionType.Deposit : LockVaultActionType.IncreaseAmount
          setAction(newAction)
          setSteps(getLockVaultActionSteps(newAction))
        }
        break;
      case vaultData.vault.address:
        if (output.address === vaultData.asset.address) {
          setAction(LockVaultActionType.Withdrawal)
          setSteps(getLockVaultActionSteps(LockVaultActionType.Withdrawal))
        } else {
          setAction(LockVaultActionType.ZapWithdrawal)
          setSteps(getLockVaultActionSteps(LockVaultActionType.ZapWithdrawal))
        }
        break;
      default:
        const newAction = vaultData.lock.unlockTime === 0 ? LockVaultActionType.ZapDeposit : LockVaultActionType.ZapIncreaseAmount
        setAction(newAction)
        setSteps(getLockVaultActionSteps(newAction))
        break;
    }
  }

  return <>
    <TabSelector
      className="mb-6"
      availableTabs={availableTabs}
      activeTab={activeTab}
      setActiveTab={() => switchActiveTab(activeTab)}
    />

    {activeTab === "Deposit" &&
      <Deposit
        vaultData={vaultData}
        tokenOptions={tokenOptions}
        inputBalState={[inputBalance, setInputBalance]}
        daysState={[days, setDays]}
        handleTokenSelect={handleTokenSelect}
        inputToken={inputToken}
      />
    }
    {activeTab === "Withdraw" &&
      <Withdraw
        vaultData={vaultData}
        tokenOptions={tokenOptions}
        handleTokenSelect={handleTokenSelect}
        outputToken={outputToken}
      />
    }
    {activeTab === "Claim" && <Claim vaultData={vaultData} />}

    <div className="w-full flex justify-center my-6">
      <ActionSteps steps={steps} stepCounter={stepCounter} />
    </div>

    <div className="">
      {account ? (
        <>
          {(stepCounter === steps.length || steps.some(step => !step.loading && step.error)) ?
            <MainActionButton label={"Close Modal"} handleClick={hideModal} /> :
            <MainActionButton
              label={steps[stepCounter].label}
              handleClick={handleMainAction}
              disabled={
                inputBalance === "0" ||
                steps[stepCounter].loading ||
                (depositDisabled && activeTab !== "Withdraw")
              }
            />
          }
        </>
      )
        : < MainActionButton label={"Connect Wallet"} handleClick={openConnectModal} />
      }
    </div>
  </>
}