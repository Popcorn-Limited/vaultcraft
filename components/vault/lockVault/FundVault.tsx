import { showSuccessToast } from "@/lib/toasts";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import CopyToClipboard from "react-copy-to-clipboard";
import VaultStats from "./VaultStats";
import VaultInteraction from "./VaultInteraction";
import Accordion from "@/components/common/Accordion";
import Modal from "@/components/modal/Modal";
import { useState } from "react";
import AssetWithName from "../AssetWithName";
import { LockVaultData, RewardToken } from "@/lib/types";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ActionStep } from "@/lib/vault/getActionSteps";
import { handleAllowance } from "@/lib/approve";
import MainActionButton from "@/components/button/MainActionButton";
import ActionSteps from "../ActionSteps";
import { safeRound } from "@/lib/utils/formatBigNumber";
import { formatUnits } from "viem";
import { validateInput } from "@/lib/utils/helpers";
import { handleDistributeRewards } from "@/lib/vault/lockVault/interactions";

const BaseStepInfo = {
  success: false,
  error: false,
  loading: false
}

const ACTION_STEPS = [{
  step: 1,
  label: "Handle Allowance",
  ...BaseStepInfo
},
{
  step: 2,
  label: "Distributing Rewards",
  ...BaseStepInfo
}]

export default function FundVault({ vaultData, mutateTokenBalance, searchTerm }: { vaultData: LockVaultData, mutateTokenBalance: () => void, searchTerm: string }): JSX.Element {
  const [showModal, setShowModal] = useState(false)

  const { address: account } = useAccount()
  const publicClient = usePublicClient({ chainId: vaultData.chainId });
  const { data: walletClient } = useWalletClient()
  const { chain } = useNetwork();

  const { switchNetworkAsync } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const [selectedToken, setSelectedToken] = useState<RewardToken>(vaultData.rewards[0]);
  const [inputBalance, setInputBalance] = useState<string>("0");

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>(ACTION_STEPS)

  async function handleMainAction() {
    const val = Number(inputBalance)
    if (val === 0 || !vaultData || !account || !walletClient) return;

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

    let success = false
    if (stepCounter === 0) {
      success = await handleAllowance({
        token: selectedToken.address,
        amount: (val * (10 ** selectedToken.decimals)),
        account,
        spender: vaultData.vault.address,
        clients
      })
    } else {
      success = await handleDistributeRewards({
        vaultData,
        account,
        token: selectedToken.address,
        amount: (val * (10 ** selectedToken.decimals)),
        clients
      })
    }

    currentStep.loading = false
    currentStep.success = success;
    currentStep.error = !success;
    const newStepCounter = stepCounter + 1
    setSteps(stepsCopy);
    setStepCounter(newStepCounter);

    if (newStepCounter === steps.length) mutateTokenBalance();
  }

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value
    setInputBalance(validateInput(value).isValid ? value : "0");
  };

  function handleMaxClick() {
    if (!selectedToken) return
    const stringBal = selectedToken.balance.toLocaleString("fullwide", { useGrouping: false })
    const rounded = safeRound(BigInt(stringBal), selectedToken.decimals)
    const formatted = formatUnits(rounded, selectedToken.decimals)
    handleChangeInput({ currentTarget: { value: formatted } })
  }

  function closeModal() {
    setStepCounter(0);
    setSteps(ACTION_STEPS)
    setShowModal(false)
  }

  if (!vaultData) return <></>
  if (searchTerm !== "" &&
    !vaultData.vault.name.toLowerCase().includes(searchTerm) &&
    !vaultData.vault.symbol.toLowerCase().includes(searchTerm))
    return <></>
  return (
    <>
      <Modal visibility={[showModal, setShowModal]} title={<AssetWithName vault={vaultData} />} >
        <div className="flex flex-col md:flex-row w-full md:gap-8 min-h-128">
          <div className="w-full md:w-1/2 text-start flex flex-col justify-between">

            <div className="space-y-4">
              <VaultStats
                vaultData={vaultData}
              />
            </div>

            <div className="hidden md:block space-y-4">
              <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                <p className="text-primary font-normal">Asset address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-primary">
                    {vaultData.asset.address.slice(0, 6)}...{vaultData.asset.address.slice(-4)}
                  </p>
                  <div className='w-6 h-6 group/assetAddress'>
                    <CopyToClipboard text={vaultData.asset.address} onCopy={() => showSuccessToast("Asset address copied!")}>
                      <Square2StackIcon className="text-white group-hover/assetAddress:text-[#DFFF1C]" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                <p className="text-primary font-normal">Vault address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-primary">
                    {vaultData.address.slice(0, 6)}...{vaultData.address.slice(-4)}
                  </p>
                  <div className='w-6 h-6 group/vaultAddress'>
                    <CopyToClipboard text={vaultData.address} onCopy={() => showSuccessToast("Vault address copied!")}>
                      <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="w-full md:w-1/2 mt-4 md:mt-0 flex-grow rounded-lg border border-[#353945] bg-[#141416] p-6">
            <InputTokenWithError
              captionText={"Reward Amount"}
              onSelectToken={option => setSelectedToken(option as RewardToken)}
              onMaxClick={handleMaxClick}
              chainId={vaultData.chainId}
              value={inputBalance}
              onChange={handleChangeInput}
              selectedToken={selectedToken}
              errorMessage={""}
              tokenList={vaultData.rewards}
              allowSelection={vaultData.rewards.length > 0}
              allowInput
            />

            <div className="w-full flex justify-center my-6">
              <ActionSteps steps={steps} stepCounter={stepCounter} />
            </div>

            <div className="">
              {account ? (
                <>
                  {(stepCounter === steps.length || steps.some(step => !step.loading && step.error)) ?
                    <MainActionButton
                      label={"Close Modal"}
                      handleClick={closeModal}
                    /> :
                    <MainActionButton
                      label={steps[stepCounter].label}
                      handleClick={handleMainAction}
                      disabled={inputBalance === "0" || steps[stepCounter].loading}
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
          </div>

        </div>
      </Modal>
      <Accordion handleClick={() => setShowModal(true)}>
        <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">
          <div className="flex items-center justify-between select-none w-full">
            <AssetWithName vault={vaultData} />
          </div>
          <VaultStats vaultData={vaultData} />
        </div>
      </Accordion >
    </>
  )
}
