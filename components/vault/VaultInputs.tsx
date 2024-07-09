import { ArrowDownIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import MainActionButton from "@/components/button/MainActionButton";
import { useEffect, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import TabSelector from "@/components/common/TabSelector";
import { SmartVaultActionType, Token, TokenType, VaultData, ZapProvider } from "@/lib/types";
import { validateInput } from "@/lib/utils/helpers";
import Modal from "@/components/modal/Modal";
import InputNumber from "@/components/input/InputNumber";
import { safeRound } from "@/lib/utils/formatBigNumber";
import { erc20Abi, formatUnits, getAddress, isAddress, maxUint256 } from "viem";
import handleVaultInteraction from "@/lib/vault/handleVaultInteraction";
import ActionSteps from "@/components/vault/ActionSteps";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { ActionStep, getSmartVaultActionSteps } from "@/lib/getActionSteps";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { networthAtom, tokensAtom, tvlAtom } from "@/lib/atoms";
import { getZapProvider } from "@/lib/vault/zap";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";

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

  const { query } = useRouter();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const { address: account, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const [tokens, setTokens] = useAtom(tokensAtom);
  const [vaults, setVaults] = useAtom(vaultsAtom);
  const [tvl, setTVL] = useAtom(tvlAtom);
  const [networth, setNetworth] = useAtom(networthAtom);

  const [inputToken, setInputToken] = useState<Token>();
  const [outputToken, setOutputToken] = useState<Token>();

  const [stepCounter, setStepCounter] = useState<number>(0);
  const [steps, setSteps] = useState<ActionStep[]>([]);
  const [action, setAction] = useState<SmartVaultActionType>(
    SmartVaultActionType.Deposit
  );

  const [inputBalance, setInputBalance] = useState<string>("0");

  const [isDeposit, setIsDeposit] = useState<boolean>(true);

  // Zap Settings
  const [zapProvider, setZapProvider] = useState(ZapProvider.none)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [tradeTimeout, setTradeTimeout] = useState<number>(300); // number of seconds a cow order is valid for
  const [slippage, setSlippage] = useState<number>(100); // In BPS 0 - 10_000

  useEffect(() => {
    // set default input/output tokens
    setInputToken(asset);
    setOutputToken(!!gauge ? gauge : vault);
    const actionType = !!gauge
      ? SmartVaultActionType.DepositAndStake
      : SmartVaultActionType.Deposit;
    setAction(actionType);
    setSteps(getSmartVaultActionSteps(actionType));
  }, []);

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value;
    setInputBalance(validateInput(value).isValid ? value : "0");
  }

  function switchTokens() {
    setStepCounter(0);
    if (isDeposit) {
      // Switch to Withdraw
      setInputToken(!!gauge ? gauge : vault);
      setOutputToken(asset);
      setIsDeposit(false);
      const newAction = !!gauge
        ? SmartVaultActionType.UnstakeAndWithdraw
        : SmartVaultActionType.Withdrawal;
      setAction(newAction);
      setSteps(getSmartVaultActionSteps(newAction));
    } else {
      // Switch to Deposit
      setInputToken(asset);
      setOutputToken(!!gauge ? gauge : vault);
      setIsDeposit(true);
      const newAction = !!gauge
        ? SmartVaultActionType.DepositAndStake
        : SmartVaultActionType.Deposit;
      setAction(newAction);
      setSteps(getSmartVaultActionSteps(newAction));
    }
  }

  function handleTokenSelect(input: Token, output: Token): void {
    setStepCounter(0);

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
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.Deposit));
            return;
          case gauge?.address:
            setIsDeposit(true);
            setAction(SmartVaultActionType.DepositAndStake);
            setSteps(
              getSmartVaultActionSteps(SmartVaultActionType.DepositAndStake)
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
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.Withdrawal));
            return;
          case vault?.address!:
            // error
            return;
          case gauge?.address:
            setIsDeposit(true);
            setAction(SmartVaultActionType.Stake);
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.Stake));
            return;
          default:
            setIsDeposit(false);
            setAction(SmartVaultActionType.ZapWithdrawal);
            setSteps(
              getSmartVaultActionSteps(SmartVaultActionType.ZapWithdrawal)
            );
            return;
        }
      case gauge?.address:
        switch (output.address) {
          case asset?.address!:
            setIsDeposit(false);
            setAction(SmartVaultActionType.UnstakeAndWithdraw);
            setSteps(
              getSmartVaultActionSteps(SmartVaultActionType.UnstakeAndWithdraw)
            );
            return;
          case vault?.address!:
            setIsDeposit(false);
            setAction(SmartVaultActionType.Unstake);
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.Unstake));
            return;
          case gauge?.address:
            // error
            return;
          default:
            setIsDeposit(false);
            setAction(SmartVaultActionType.ZapUnstakeAndWithdraw);
            setSteps(
              getSmartVaultActionSteps(
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
            setSteps(getSmartVaultActionSteps(SmartVaultActionType.ZapDeposit));
            return;
          case gauge?.address:
            setIsDeposit(true);
            setAction(SmartVaultActionType.ZapDepositAndStake);
            setSteps(
              getSmartVaultActionSteps(SmartVaultActionType.ZapDepositAndStake)
            );
            return;
          default:
            // error
            return;
        }
    }
  }

  async function handleMainAction() {
    let val = Number(inputBalance)
    if (val === 0 || !inputToken || !outputToken || !asset || !vault || !account || !walletClient) return;
    val = val * (10 ** inputToken.decimals)

    if (chain?.id !== Number(chainId)) {
      try {
        await switchChainAsync?.({ chainId: Number(chainId) });
      } catch (error) {
        return;
      }
    }

    let newZapProvider = zapProvider
    if (newZapProvider === ZapProvider.none && [SmartVaultActionType.ZapDeposit, SmartVaultActionType.ZapDepositAndStake, SmartVaultActionType.ZapUnstakeAndWithdraw, SmartVaultActionType.ZapWithdrawal].includes(action)) {
      showLoadingToast("Searching for the best price...")
      if ([SmartVaultActionType.ZapDeposit, SmartVaultActionType.ZapDepositAndStake].includes(action)) {
        newZapProvider = await getZapProvider({ sellToken: inputToken, buyToken: asset, amount: val, chainId, account })
      } else {
        newZapProvider = await getZapProvider({ sellToken: asset, buyToken: outputToken, amount: val, chainId, account })
      }

      setZapProvider(newZapProvider)

      if (newZapProvider === ZapProvider.notFound) {
        showErrorToast("Zap not available. Please try a different token.")
        return
      } else {
        showSuccessToast(`Using ${String(ZapProvider[newZapProvider])} for your zap`)
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
      amount: val,
      inputToken,
      outputToken,
      vaultData,
      asset,
      vault,
      gauge,
      account,
      zapProvider: newZapProvider,
      slippage,
      tradeTimeout,
      clients: { publicClient: publicClient!, walletClient },
      referral:
        !!query?.ref && isAddress(query.ref as string)
          ? getAddress(query.ref as string)
          : undefined,
      tokensAtom: [tokens, setTokens]
    });
    const success = await vaultInteraction();

    currentStep.loading = false;
    currentStep.success = success;
    currentStep.error = !success;

    const newStepCounter = stepCounter + 1;
    setSteps(stepsCopy);
    setStepCounter(newStepCounter);

    if (newStepCounter === steps.length && success) {
      const newSupply = await publicClient?.readContract({
        address: vaultData.address,
        abi: erc20Abi,
        functionName: "totalSupply"
      })
      const index = vaults[vaultData.chainId].findIndex(v => v.address === vaultData.address)
      const newNetworkVaults = [...vaults[vaultData.chainId]]
      newNetworkVaults[index] = {
        ...vaultData,
        totalSupply: Number(newSupply),
        tvl: (Number(newSupply) * vault.price) / (10 ** vault.decimals)
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
        .reduce((a, b) => a + ((b.balance / (10 ** b.decimals)) * b.price), 0)
      const assetNetworth = SUPPORTED_NETWORKS.map(chain =>
        Object.values(tokens[chain.id])).flat().filter(t => t.type === TokenType.Asset)
        .reduce((a, b) => a + ((b.balance / (10 ** b.decimals)) * b.price), 0)

      setNetworth({
        vault: vaultNetworth,
        lockVault: networth.lockVault,
        wallet: assetNetworth,
        stake: networth.stake,
        total: vaultNetworth + assetNetworth + networth.lockVault + networth.stake
      })
    }
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

  if (!inputToken || !outputToken || !asset || !vault) return <></>;
  return (
    <>
      <Modal visibility={[showModal, setShowModal]}>
        <div className="text-start">
          <p>Slippage (in BPS)</p>
          <div className="w-full rounded-lg border border-white p-2">
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
        onSelectToken={(option) =>
          handleTokenSelect(option, !!gauge ? gauge : vault)
        }
        onMaxClick={handleMaxClick}
        chainId={chainId}
        value={inputBalance}
        onChange={handleChangeInput}
        selectedToken={inputToken}
        errorMessage={""}
        tokenList={tokenOptions.filter((token) =>
          gauge?.address
            ? token.address !== gauge?.address
            : token.address !== vault?.address
        )}
        allowSelection={isDeposit}
        allowInput
      />

      {vaultData.depositLimit < maxUint256 &&
        <span className="flex flex-row items-center justify-between text-[#D7D7D7]">
          <p>Deposit Limit:</p>
          <p>{vaultData.depositLimit / (10 ** asset.decimals)} {asset.symbol}</p>
        </span>
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
          handleTokenSelect(!!gauge ? gauge : vault, option)
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
            : token.address !== vault.address
        )}
        allowSelection={!isDeposit}
        allowInput={false}
      />
      {((isDeposit &&
        ![asset.address, vault.address].includes(inputToken.address)) ||
        (!isDeposit &&
          ![asset.address, vault.address].includes(outputToken.address))) && (
          <div
            className="group/zap flex flex-row items-center cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <Cog6ToothIcon
              className="h-5 w-5 mt-1 mr-2 text-customGray300 group-hover/zap:text-white"
              aria-hidden="true"
            />
            <p className="text-customGray300 group-hover/zap:text-white">
              Zap Settings
            </p>
          </div>
        )}

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

      <div className="w-full flex justify-center my-6">
        <ActionSteps steps={steps} stepCounter={stepCounter} />
      </div>

      <div className="">
        {account ? (
          <>
            {stepCounter === steps.length ||
              steps.some((step) => !step.loading && step.error) ? (
              <MainActionButton label={"Finish"} handleClick={hideModal} />
            ) : (
              <MainActionButton
                label={steps[stepCounter].label}
                handleClick={handleMainAction}
                disabled={inputBalance === "0" || steps[stepCounter].loading}
              />
            )}
          </>
        ) : (
          <MainActionButton
            label={"Connect Wallet"}
            handleClick={openConnectModal}
          />
        )}
      </div>
    </>
  );
}
