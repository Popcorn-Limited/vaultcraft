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
import { ActionStep } from "@/lib/vault/getActionSteps";
import { LockVaultActionType, LockVaultData } from "@/lib/types";
import getActionSteps from "@/lib/vault/lockVault/getActionSteps";
import Claim from "./Claim";
import { handleClaim, handleDeposit, handleIncreaseAmount, handleWithdraw } from "@/lib/vault/lockVault/interactions";
import { handleAllowance } from "@/lib/approve";
import { getAddress, isAddress } from "viem";
import { validateInput } from "@/lib/utils/helpers";

interface VaultInteractionProps {
  vaultData: LockVaultData;
  hideModal: () => void;
  mutateTokenBalance: () => void;
}

export default function VaultInteraction({ vaultData, hideModal, mutateTokenBalance }: VaultInteractionProps): JSX.Element {
  const { query } = useRouter()
  const [masaSdk,] = useAtom(masaAtom)

  const { address: account } = useAccount()
  const publicClient = usePublicClient({ chainId: vaultData.chainId });
  const { data: walletClient } = useWalletClient()
  const { chain } = useNetwork();

  const { switchNetworkAsync } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const [inputBalance, setInputBalance] = useState<string>("0");
  const [days, setDays] = useState<string>(String(vaultData.lock.daysToUnlock));

  const isDeposit = vaultData.lock.unlockTime === 0 || vaultData.lock.daysToUnlock > 0

  const [availableTabs, setAvailableTabs] = useState<string[]>(["Deposit", "Claim"])
  const [activeTab, setActiveTab] = useState<string>("Deposit")

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>([])
  const [action, setAction] = useState<LockVaultActionType>(LockVaultActionType.Deposit)

  useEffect(() => {
    setAvailableTabs([isDeposit ? "Deposit" : "Withdraw", "Claim"])
    setActiveTab(isDeposit ? "Deposit" : "Withdraw")

    if (isDeposit) {
      const newAction = vaultData.lock.unlockTime === 0 ? LockVaultActionType.Deposit : LockVaultActionType.IncreaseAmount
      setAction(newAction)
      setSteps(getActionSteps(newAction))
    } else {
      setAction(LockVaultActionType.Withdrawal)
      setSteps(getActionSteps(LockVaultActionType.Withdrawal))
      setInputBalance(String(vaultData.lock.amount / (10 ** vaultData.vault.decimals)))
    }
  }, [vaultData])

  function switchActiveTab(tab: string) {
    setStepCounter(0)
    if (tab === "Claim") {
      setActiveTab(isDeposit ? "Deposit" : "Withdraw")
      if (isDeposit) {
        const newAction = vaultData.lock.unlockTime === 0 ? LockVaultActionType.Deposit : LockVaultActionType.IncreaseAmount
        setAction(newAction)
        setSteps(getActionSteps(newAction))
        setInputBalance("0")
      } else {
        setAction(LockVaultActionType.Withdrawal)
        setSteps(getActionSteps(LockVaultActionType.Withdrawal))
        setInputBalance(String(vaultData.lock.amount / (10 ** vaultData.vault.decimals)))
      }
    } else {
      setActiveTab("Claim")
      setAction(LockVaultActionType.Claim)
      setSteps(getActionSteps(LockVaultActionType.Claim))
      setInputBalance(String(vaultData.reward.balance / (10 ** vaultData.reward.decimals)))
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

    const clients = {
      publicClient,
      walletClient
    }

    const ref = {
      fireEvent: masaSdk?.fireEvent,
      referral: !!query?.ref && isAddress(query.ref as string) ? getAddress(query.ref as string) : undefined
    }

    let success = false
    switch (action) {
      case LockVaultActionType.Deposit:
        if (stepCounter === 0) {
          success = await handleAllowance({
            token: vaultData.asset.address,
            amount: (val * (10 ** vaultData.asset.decimals)),
            account,
            spender: vaultData.vault.address,
            clients
          })
        } else {
          success = await handleDeposit({
            vaultData,
            account,
            amount: (val * (10 ** vaultData.asset.decimals)),
            days: Number(days),
            clients,
            ...ref
          })
        }
        break;
      case LockVaultActionType.IncreaseAmount:
        if (stepCounter === 0) {
          success = await handleAllowance({
            token: vaultData.asset.address,
            amount: (val * (10 ** vaultData.asset.decimals)),
            account,
            spender: vaultData.vault.address,
            clients
          })
        } else {
          success = await handleIncreaseAmount({
            vaultData,
            account,
            amount: (val * (10 ** vaultData.asset.decimals)),
            clients
          })
        }
        break;
      case LockVaultActionType.Withdrawal:
        success = await handleWithdraw({
          vaultData,
          account,
          amount: (val * (10 ** vaultData.vault.decimals)),
          clients,
          ...ref
        })
        break;
      case LockVaultActionType.Claim:
        success = await handleClaim({
          vaultData,
          account,
          clients
        })
        break;
    }

    currentStep.loading = false
    currentStep.success = success;
    currentStep.error = !success;
    const newStepCounter = stepCounter + 1
    setSteps(stepsCopy)
    setStepCounter(newStepCounter)

    if (newStepCounter === steps.length) mutateTokenBalance()
  }

  return <>
    <TabSelector
      className="mb-6"
      availableTabs={availableTabs}
      activeTab={activeTab}
      setActiveTab={() => switchActiveTab(activeTab)}
    />

    {activeTab === "Deposit" && <Deposit vaultData={vaultData} inputBalState={[inputBalance, setInputBalance]} daysState={[days, setDays]} />}
    {activeTab === "Withdraw" && <Withdraw vaultData={vaultData} />}
    {activeTab === "Claim" && <Claim vaultData={vaultData} />}

    <div className="w-full flex justify-center my-6">
      <ActionSteps steps={steps} stepCounter={stepCounter} />
    </div>

    <div className="">
      {account ? (
        <>
          {(stepCounter === steps.length || steps.some(step => !step.loading && step.error)) ?
            <MainActionButton
              label={"Close Modal"}
              handleClick={hideModal}
            /> :
            <MainActionButton
              label={steps[stepCounter].label}
              handleClick={handleMainAction}
              disabled={inputBalance === "0" || steps[stepCounter].loading || (action === LockVaultActionType.Deposit && Number(days) === 0)}
            />
          }
        </>
      )
        : < MainActionButton
          label={"Connect Wallet"}
          handleClick={openConnectModal}
        />
      }
    </div>
  </>
}