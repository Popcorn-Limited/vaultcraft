import { useAccount } from "wagmi";
import TabSelector from "@/components/common/TabSelector"
import InputTokenWithError from "@/components/input/InputTokenWithError"
import { tokensAtom } from "@/lib/atoms"
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts"
import { Balance, VaultActionType, Token, VaultAction, VaultData, ZapProvider } from "@/lib/types"
import { EMPTY_BALANCE, formatBalance, NumberFormatter } from "@/lib/utils/helpers"
import { ArrowDownIcon } from "@heroicons/react/24/outline"
import { useAtom } from "jotai"
import { useState } from "react"
import { maxUint256, parseUnits } from "viem"
import getVaultErrorMessage from "@/lib/vault/errorMessage";
import MainButtonGroup from "../common/MainButtonGroup";
import { getZapProvider } from "@/lib/zap/zapProvider";
import VaultInteractionContainer from "./VaultInteraction";
import { selectActions } from "@/lib/vault/vaultHelpers";
import VaultFeeBreakdown from "./VaultFees";
import findZapProvider from "@/lib/zap/findZapProvider";

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

  const [steps, setSteps] = useState<VaultAction[]>([]);
  const [action, setAction] = useState<VaultActionType>(VaultActionType.Deposit);

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
            setAction(VaultActionType.Deposit);
            setSteps(selectActions(VaultActionType.Deposit));
            return;
          case gauge?.address:
            setIsDeposit(true);
            setAction(VaultActionType.DepositAndStake);
            setSteps(
              selectActions(VaultActionType.DepositAndStake)
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
            setAction(VaultActionType.Withdrawal);
            setSteps(selectActions(VaultActionType.Withdrawal));
            return;
          case vault?.address!:
            // error
            return;
          case gauge?.address:
            setIsDeposit(true);
            setAction(VaultActionType.Stake);
            setSteps(selectActions(VaultActionType.Stake));
            return;
          default:
            setIsDeposit(false);
            setAction(VaultActionType.ZapWithdrawal);
            setSteps(
              selectActions(VaultActionType.ZapWithdrawal)
            );
            return;
        }
      case gauge?.address:
        switch (output.address) {
          case asset?.address!:
            setIsDeposit(false);
            setAction(VaultActionType.UnstakeAndWithdraw);
            setSteps(
              selectActions(VaultActionType.UnstakeAndWithdraw)
            );
            return;
          case vault?.address!:
            setIsDeposit(false);
            setAction(VaultActionType.Unstake);
            setSteps(selectActions(VaultActionType.Unstake));
            return;
          case gauge?.address:
            // error
            return;
          default:
            setIsDeposit(false);
            setAction(VaultActionType.ZapUnstakeAndWithdraw);
            setSteps(
              selectActions(
                VaultActionType.ZapUnstakeAndWithdraw
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
            setAction(VaultActionType.ZapDeposit);
            setSteps(selectActions(VaultActionType.ZapDeposit));
            return;
          case gauge?.address:
            setIsDeposit(true);
            setAction(VaultActionType.ZapDepositAndStake);
            setSteps(
              selectActions(VaultActionType.ZapDepositAndStake)
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
        ? VaultActionType.UnstakeAndWithdraw
        : VaultActionType.Withdrawal;
      setAction(newAction);
      setSteps(selectActions(newAction));
    } else {
      // Switch to Deposit
      setInputToken(undefined);
      setOutputToken(!!gauge ? gauge : vault);
      setIsDeposit(true);
      const newAction = !!gauge
        ? VaultActionType.DepositAndStake
        : VaultActionType.Deposit;
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

  async function handlePreview() {
    if (!inputToken || !outputToken || !asset || !account) return;

    const success = await findZapProvider({
      action,
      inputToken,
      outputToken,
      asset,
      inputBalance,
      zapProvider,
      account,
      vaultData,
      setter: setZapProvider
    });
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
              className="flex flex-row items-center justify-between text-customGray100 hover:text-customGray200 cursor-pointer mt-2"
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
              className="flex flex-row items-center justify-between text-customGray100 hover:text-customGray200 cursor-pointer mt-2"
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
    <VaultFeeBreakdown vaultData={vaultData} />

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
      <VaultInteractionContainer
        _inputToken={inputToken}
        _outputToken={outputToken}
        zapProvider={zapProvider}
        _inputBalance={inputBalance}
        _action={steps[0]}
        actionSeries={action}
        actions={steps}
        vaultData={vaultData}
        setShowModal={setShowModal}
      />
    }
  </>
}