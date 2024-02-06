import { ArrowDownIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import MainActionButton from "@/components/button/MainActionButton";
import { useEffect, useState } from "react";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import TabSelector from "@/components/common/TabSelector";
import { SmartVaultActionType, Token, VaultData } from "@/lib/types";
import { validateInput } from "@/lib/utils/helpers";
import Modal from "@/components/modal/Modal";
import InputNumber from "@/components/input/InputNumber";
import { safeRound } from "@/lib/utils/formatBigNumber";
import { formatUnits, getAddress, isAddress } from "viem";
import handleVaultInteraction from "@/lib/vault/handleVaultInteraction";
import ActionSteps from "@/components/vault/ActionSteps";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAtom } from "jotai";
import { masaAtom } from "@/lib/atoms/sdk";
import { useRouter } from "next/router";
import { ActionStep, getSmartVaultActionSteps } from "@/lib/getActionSteps";
import { MutateTokenBalanceProps } from "@/lib/vault/mutateTokenBalance";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { zapAssetsAtom } from "@/lib/atoms";

export interface VaultInputsProps {
  vaultData: VaultData;
  tokenOptions: Token[];
  chainId: number;
  hideModal: () => void;
}

export default function VaultInputs(
  { vaultData, tokenOptions, chainId, hideModal, mutateTokenBalance }
    : VaultInputsProps & { mutateTokenBalance: (props: MutateTokenBalanceProps) => void }
): JSX.Element {
  const { asset, vault, gauge } = vaultData;
  const { query } = useRouter()

  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient()
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const [masaSdk,] = useAtom(masaAtom)
  const [zapAssets, setZapAssets] = useAtom(zapAssetsAtom)
  const [vaults, setVaults] = useAtom(vaultsAtom)

  const [inputToken, setInputToken] = useState<Token>()
  const [outputToken, setOutputToken] = useState<Token>()

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>([])
  const [action, setAction] = useState<SmartVaultActionType>(SmartVaultActionType.Deposit)

  const [inputBalance, setInputBalance] = useState<string>("0");

  const [isDeposit, setIsDeposit] = useState<boolean>(true);

  // Zap Settings
  const [showModal, setShowModal] = useState<boolean>(false)
  const [tradeTimeout, setTradeTimeout] = useState<number>(300); // number of seconds a cow order is valid for
  const [slippage, setSlippage] = useState<number>(100); // In BPS 0 - 10_000

  useEffect(() => {
    // set default input/output tokens
    setInputToken(asset)
    setOutputToken(!!gauge ? gauge : vault)
    const actionType = !!gauge ? SmartVaultActionType.DepositAndStake : SmartVaultActionType.Deposit
    setAction(actionType)
    setSteps(getSmartVaultActionSteps(actionType))
  }, [])

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value
    setInputBalance(validateInput(value).isValid ? value : "0");
  };

  function switchTokens() {
    setStepCounter(0)
    if (isDeposit) {
      // Switch to Withdraw
      setInputToken(!!gauge ? gauge : vault);
      setOutputToken(asset)
      setIsDeposit(false)
      const newAction = !!gauge ? SmartVaultActionType.UnstakeAndWithdraw : SmartVaultActionType.Withdrawal
      setAction(newAction)
      setSteps(getSmartVaultActionSteps(newAction))
    } else {
      // Switch to Deposit
      setInputToken(asset);
      setOutputToken(!!gauge ? gauge : vault)
      setIsDeposit(true)
      const newAction = !!gauge ? SmartVaultActionType.DepositAndStake : SmartVaultActionType.Deposit
      setAction(newAction)
      setSteps(getSmartVaultActionSteps(newAction))
    }
  }

  function handleTokenSelect(input: Token, output: Token): void {
    setInputToken(input);
    setOutputToken(output)

    switch (input.address) {
      case asset.address:
        switch (output.address) {
          case asset.address:
            // error
            return
          case vault.address:
            setAction(SmartVaultActionType.Deposit)
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.Deposit))
            return
          case gauge?.address:
            setAction(SmartVaultActionType.DepositAndStake)
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.DepositAndStake))
            return
          default:
            // error
            return
        }
      case vault.address:
        switch (output.address) {
          case asset.address:
            setAction(SmartVaultActionType.Withdrawal)
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.Withdrawal))
            return
          case vault.address:
            // error
            return
          case gauge?.address:
            setAction(SmartVaultActionType.Stake)
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.Stake))
            return
          default:
            setAction(SmartVaultActionType.ZapWithdrawal)
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.ZapWithdrawal))
            return
        }
      case gauge?.address:
        switch (output.address) {
          case asset.address:
            setAction(SmartVaultActionType.UnstakeAndWithdraw)
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.UnstakeAndWithdraw))
            return
          case vault.address:
            setAction(SmartVaultActionType.Unstake)
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.Unstake))
            return
          case gauge?.address:
            // error
            return
          default:
            setAction(SmartVaultActionType.ZapUnstakeAndWithdraw)
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.ZapUnstakeAndWithdraw))
            return
        }
      default:
        switch (output.address) {
          case asset.address:
            // error
            return
          case vault.address:
            setAction(SmartVaultActionType.ZapDeposit)
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.ZapDeposit))
            return
          case gauge?.address:
            setAction(SmartVaultActionType.ZapDepositAndStake)
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.ZapDepositAndStake))
            return
          default:
            // error
            return
        }
    }
  }

  async function handleMainAction() {
    const val = Number(inputBalance)
    if (val === 0 || !inputToken || !outputToken || !account || !walletClient) return;

    if (chain?.id !== Number(chainId)) {
      try {
        await switchNetworkAsync?.(Number(chainId));
      } catch (error) {
        return
      }
    }

    const stepsCopy = [...steps]
    const currentStep = stepsCopy[stepCounter]
    currentStep.loading = true
    setSteps(stepsCopy)

    const vaultInteraction = await handleVaultInteraction({
      action,
      stepCounter,
      chainId,
      amount: (val * (10 ** inputToken.decimals)),
      inputToken,
      outputToken,
      vaultData,
      account,
      slippage,
      tradeTimeout,
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

    if (newStepCounter === steps.length) mutateTokenBalance({
      inputToken: inputToken.address,
      outputToken: outputToken.address,
      vault: vault.address,
      chainId,
      account,
      zapAssetState: [zapAssets, setZapAssets],
      vaultsState: [vaults, setVaults],
      publicClient
    })
  }

  function handleMaxClick() {
    if (!inputToken) return
    const stringBal = inputToken.balance.toLocaleString("fullwide", { useGrouping: false })
    const rounded = safeRound(BigInt(stringBal), inputToken.decimals)
    const formatted = formatUnits(rounded, inputToken.decimals)
    handleChangeInput({ currentTarget: { value: formatted } })
  }

  if (!inputToken || !outputToken) return <></>
  return <>
    <Modal visibility={[showModal, setShowModal]}>
      <div className="text-start">
        <p>Slippage (in BPS)</p>
        <div className="w-full rounded-lg border border-primary p-2">
          <InputNumber
            value={slippage}
            onChange={(e) => setSlippage(Number(e.currentTarget.value))}
          />
        </div>
      </div>
    </Modal>
    <TabSelector
      className="mb-6"
      availableTabs={["Deposit", "Withdraw"]}
      activeTab={isDeposit ? "Deposit" : "Withdraw"}
      setActiveTab={switchTokens}
    />
    <InputTokenWithError
      captionText={isDeposit ? "Deposit Amount" : "Withdraw Amount"}
      onSelectToken={option => handleTokenSelect(option, !!gauge ? gauge : vault)}
      onMaxClick={handleMaxClick}
      chainId={chainId}
      value={inputBalance}
      onChange={handleChangeInput}
      selectedToken={inputToken}
      errorMessage={""}
      tokenList={tokenOptions.filter(token =>
        gauge?.address
          ? token.address !== gauge?.address
          : token.address !== vault.address
      )}
      allowSelection={isDeposit}
      allowInput
    />

    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-500" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#141416] px-4">
          <ArrowDownIcon
            className="h-10 w-10 p-2 text-gray-500 border border-gray-500 rounded-full cursor-pointer hover:text-primary hover:border-primary"
            aria-hidden="true"
            onClick={switchTokens}
          />
        </span>
      </div>
    </div>

    <InputTokenWithError
      captionText={"Output Amount"}
      onSelectToken={option => handleTokenSelect(!!gauge ? gauge : vault, option)}
      onMaxClick={() => { }}
      chainId={chainId}
      value={(Number(inputBalance) * (Number(inputToken?.price)) / Number(outputToken?.price)) || 0}
      onChange={() => { }}
      selectedToken={outputToken}
      errorMessage={""}
      tokenList={tokenOptions.filter(token =>
        gauge?.address
          ? token.address !== gauge?.address
          : token.address !== vault.address
      )}
      allowSelection={!isDeposit}
      allowInput={false}
    />
    {((isDeposit && ![asset.address, vault.address].includes(inputToken.address)) ||
      (!isDeposit && ![asset.address, vault.address].includes(outputToken.address))) &&
      <div className="group/zap flex flex-row items-center cursor-pointer" onClick={() => setShowModal(true)}>
        <Cog6ToothIcon className="h-5 w-5 mt-1 mr-2 text-secondaryLight group-hover/zap:text-primary" aria-hidden="true" />
        <p className="text-secondaryLight group-hover/zap:text-primary">Zap Settings</p>
      </div >
    }

    <div className="mt-6">
      <p className="text-white font-bold mb-2 text-start">Fee Breakdown</p>
      <div className="bg-[#23262f] py-2 px-4 rounded-lg space-y-2">
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

    <div className="w-full flex justify-center my-6">
      <ActionSteps steps={steps} stepCounter={stepCounter} />
    </div>

    <div className="">
      {account ? (
        <>
          {(stepCounter === steps.length || steps.some(step => !step.loading && step.error)) ?
            <MainActionButton label={"Finish"} handleClick={hideModal} /> :
            <MainActionButton label={steps[stepCounter].label} handleClick={handleMainAction} disabled={inputBalance === "0" || steps[stepCounter].loading} />
          }
        </>
      )
        : < MainActionButton label={"Connect Wallet"} handleClick={openConnectModal} />
      }
    </div>
  </>
}