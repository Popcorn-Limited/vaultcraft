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
import { SmartVaultActionType, Token, TokenType, VaultData } from "@/lib/types";
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
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import PreviewInterface from "@/components/preview/PreviewInterface";

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
  const [showModal, setShowModal] = useState<boolean>(false)
  const [tradeTimeout, setTradeTimeout] = useState<number>(300); // number of seconds a cow order is valid for
  const [slippage, setSlippage] = useState<number>(100); // In BPS 0 - 10_000

  const [showPreviewModal, setShowPreviewModal] = useState(false)

  useEffect(() => {
    // set default input/output tokens
    setInputToken(asset);
    setOutputToken(!!gauge ? gauge : vault);
    const actionType = !!gauge
      ? SmartVaultActionType.DepositAndStake
      : SmartVaultActionType.Deposit;
    setAction(actionType);
    setSteps(getSmartVaultActionSteps(SmartVaultActionType.Preview));
  }, []);

  async function handleChangeInput(e: any) {
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
      // setSteps(getSmartVaultActionSteps(SmartVaultActionType.Preview));
    } else {
      // Switch to Deposit
      setInputToken(asset);
      setOutputToken(!!gauge ? gauge : vault);
      setIsDeposit(true);
      const newAction = !!gauge
        ? SmartVaultActionType.DepositAndStake
        : SmartVaultActionType.Deposit;
      setAction(newAction);
      // setSteps(getSmartVaultActionSteps(SmartVaultActionType.Preview));
    }
  }

  async function handleTokenSelect(input: Token, output: Token): Promise<void> {
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
            return;
          case gauge?.address:
            setIsDeposit(true);
            setAction(SmartVaultActionType.DepositAndStake);
            return;
          case "0x319121F8F39669599221A883Bb6d7d0Feef0E69c": 
            setIsDeposit(true);
            setAction(SmartVaultActionType.PeapodsStake);
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
            return;
          case vault?.address!:
            // error
            return;
          case gauge?.address:
            setIsDeposit(true);
            setAction(SmartVaultActionType.Stake);
            return;
          default:
            setIsDeposit(false);
            setAction(SmartVaultActionType.ZapWithdrawal);
            return;
        }
      case gauge?.address:
        switch (output.address) {
          case asset?.address!:
            setIsDeposit(false);
            setAction(SmartVaultActionType.UnstakeAndWithdraw);
            return;
          case vault?.address!:
            setIsDeposit(false);
            setAction(SmartVaultActionType.Unstake);
            return;
          case gauge?.address:
            // error
            return;
          default:
            setIsDeposit(false);
            setAction(SmartVaultActionType.ZapUnstakeAndWithdraw);
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
            return;
          case gauge?.address:
            setIsDeposit(true);
            setAction(SmartVaultActionType.ZapDepositAndStake);
            return;
          default:
            // error
            return;
        }
    }
  }

  async function handleSwitchChain() {
    showLoadingToast("Switching chain..")
    try {
      await switchChainAsync?.({ chainId: Number(chainId) });
      showSuccessToast("Success");
    } catch (error) {
      showErrorToast("Failed switching chain")
      return;
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
      <PreviewInterface 
        visibilityState={[showPreviewModal, setShowPreviewModal]} 
        vaultData={vaultData} 
        inAmount={inputBalance} 
        outputToken={outputToken}
        inputToken={inputToken}
        vaultAsset={asset}
        vault={vault}
        gauge={gauge}
        actionType={action}
        slippage={slippage}
        tradeTimeout={tradeTimeout}
      />
      
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
        onChange={e => handleChangeInput(e)}
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

      <div className="">

        {(chain?.id !== Number(chainId)) ? (
          <>
            <MainActionButton
              label="Switch Chain"
              handleClick={handleSwitchChain}
            />
          </>
        )
          : account ? (
            <>
              {stepCounter === steps.length ||
                steps.some((step) => !step.loading && step.error) ? (
                <MainActionButton label={"Finish"} handleClick={hideModal} />
              ) : (
                <MainActionButton
                  label={steps[stepCounter].label}
                  handleClick={() => setShowPreviewModal(true)}
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
