import AssetWithName from "@/components/common/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { ReserveData, Token, UserAccountData, VaultData, ZapProvider } from "@/lib/types";
import { useAtom } from "jotai";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { erc20Abi, formatUnits, zeroAddress, isAddress, getAddress } from "viem";
import { formatNumber, formatToFixedDecimals, safeRound } from "@/lib/utils/formatBigNumber";
import { validateInput } from "@/lib/utils/helpers";
import MainActionButton from "@/components/button/MainActionButton";
import { DEFAULT_ASSET, tokensAtom } from "@/lib/atoms";
import TabSelector from "@/components/common/TabSelector";
import Modal from "@/components/modal/Modal";
import InputTokenStatic from "@/components/preview/StaticInputToken";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import { ArrowDownIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { SmartVaultActionType, TokenType } from "@/lib/types";
import { ActionStep, getSmartVaultActionSteps } from "@/lib/getActionSteps";
import ActionSteps from "@/components/vault/ActionSteps";
import { getZapProvider } from "@/lib/vault/zap";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts";
import handleVaultInteraction from "@/lib/vault/handleVaultInteraction";
import { useRouter } from "next/router";
import { handleAllowance } from "@/lib/approve";
import { VaultRouterByChain } from "@/lib/constants";
import { vaultDepositAndStake } from "@/lib/vault/interactions";
import { getActionsByType, ActionProps, ActionButton } from "@/lib/getActions";

export default function PreviewInterface({ visibilityState, vaultData, inAmount, outputToken, vaultAsset, inputToken, gauge, vault, actionType }: {
  visibilityState: [boolean, Dispatch<SetStateAction<boolean>>],
  vaultData: VaultData,
  actionType: SmartVaultActionType,
  inAmount: [string, Dispatch<SetStateAction<string>>],
  outputToken: Token,
  vaultAsset: Token,
  gauge?: Token,
  vault: Token,
  inputToken: Token,
}): JSX.Element {
  const [visible, setVisible] = visibilityState
  const [inputAmount, setInputAmount] = inAmount;
  const action = actionType;

  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()
  const { openConnectModal } = useConnectModal();
  const clients = { publicClient: publicClient!, walletClient: walletClient! };

  const [zapProvider, setZapProvider] = useState(ZapProvider.none) // TODO pass from above

  const [slippage, setSlippage] = useState<number>(100); // In BPS 0 - 10_000 // pass from above
  const [tradeTimeout, setTradeTimeout] = useState<number>(300); // number of seconds a cow order is valid for // pass from above
  const [tokens, setTokens] = useAtom(tokensAtom);
  const [actions, setActions] = useState<ActionProps[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState<boolean>(false);
  const [stepLoading, setStepLoading] = useState<boolean>(false);

  // const [finish, setFinish] = useState<boolean>(false);

  const inputProps = { readOnly: true }

  const { query } = useRouter();

  const outputAmount = (Number(inputAmount) * Number(inputToken?.price)) /
  Number(outputToken?.price) || 0

  const executeActionAndUpdateState = async (action: () => Promise<boolean>) => {
    setStepLoading(true);
    try {
      const success = await action();
      setStepLoading(false);
      if (success) {
        setError(false);
        setCurrentStep(currentStep + 1);
        showSuccessToast("Done");
      } else {
        showErrorToast("Error")
        setError(true);
      }
    } catch (err) {
      showErrorToast("Error")
      setError(true);
    }
  }

  useEffect(() => {
    setActions(
      getActionsByType({
        vaultRouter: VaultRouterByChain[vaultData.chainId],
        actionType,
        vaultData,
        inputAmount: Number(inputAmount),
        inputToken,
        outputToken,
        outputAmount,
        account: account!,
        zapProvider,
        slippage,
        tradeTimeout,
        vaultAsset,
        vault,
        referral: !!query?.ref && isAddress(query.ref as string)
          ? getAddress(query.ref as string)
          : undefined,
        clients,
        tokensAtom: [tokens, setTokens]
      })
    );
  }, [visible, inputAmount, action])

  return <>
    <Modal
      visibility={visibilityState}
      title={vaultData.address ?
        <AssetWithName vault={vaultData} /> :
        <h2 className={`text-2xl font-bold text-white`}>
          Tranasaction Preview
        </h2>
      }
    >
      <div className="w-full md:flex md:flex-row md:space-x-20">
        <div className="w-full">
          {!account &&
            <div>
              <MainActionButton
                label="Connect Wallet"
                handleClick={openConnectModal}
              />
            </div>
          }
          {
            (account && !inputToken || actions.length === 0) &&
            <p className="text-white">Nothing to do here</p>
          }

          <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-5 text-start">
            <div className="w-full">
              {actions.map((action, i) => (
                <div className="p-8">
                  <p className="text-lg">{action.title}</p>
                  <p>{action.description}</p>
                  <MainActionButton
                    label={action.button.label}
                    handleClick={() => executeActionAndUpdateState(action.button.action)}
                    disabled={stepLoading || error || currentStep !== action.id} />
                </div>
              ))}
            </div>
            {
              (currentStep === actions.length + 1 ||
              error) && (
                <div className="w-full">
                  <MainActionButton label={"Finish"} handleClick={() => {
                    setVisible(false)
                    setError(false)
                    setCurrentStep(1)
                  }}
                  />
                </div>
              )
            }
          </div>
        </div>
      </div>
    </Modal>
  </>
}