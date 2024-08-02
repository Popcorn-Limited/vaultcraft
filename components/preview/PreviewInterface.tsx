import AssetWithName from "@/components/common/AssetWithName";
import { ReserveData, Token, UserAccountData, VaultData, ZapProvider } from "@/lib/types";
import { useAtom } from "jotai";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { erc20Abi, formatUnits, zeroAddress, isAddress, getAddress } from "viem";
import MainActionButton from "@/components/button/MainActionButton";
import { tokensAtom } from "@/lib/atoms";
import Modal from "@/components/modal/Modal";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { SmartVaultActionType } from "@/lib/types";
import { getZapProvider } from "@/lib/vault/zap";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts";
import { useRouter } from "next/router";
import { VaultRouterByChain } from "@/lib/constants";
import { getActionsByType, ActionProps } from "@/lib/getActions";

export default function PreviewInterface({ visibilityState, vaultData, inAmount, outputToken, vaultAsset, inputToken, gauge, vault, actionType }: {
  visibilityState: [boolean, Dispatch<SetStateAction<boolean>>],
  vaultData: VaultData,
  actionType: SmartVaultActionType,
  inAmount: string,
  outputToken: Token,
  vaultAsset: Token,
  gauge?: Token,
  vault: Token,
  inputToken: Token,
}): JSX.Element {
  const [visible, setVisible] = visibilityState
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()
  const { openConnectModal } = useConnectModal();
  const clients = { publicClient: publicClient!, walletClient: walletClient! };

  const [slippage, setSlippage] = useState<number>(100); // In BPS 0 - 10_000 // TODO pass from above
  const [tradeTimeout, setTradeTimeout] = useState<number>(300); // number of seconds a cow order is valid for // TODO pass from above
  const [tokens, setTokens] = useAtom(tokensAtom);
  const [actions, setActions] = useState<ActionProps[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState<boolean>(false);
  const [stepLoading, setStepLoading] = useState<boolean>(false);
  const [zapLoading, setZapLoading] = useState<boolean>(false);
  const [zapProvider, setZapProvider] = useState(ZapProvider.none)
  const zapTypes = [SmartVaultActionType.ZapDeposit, SmartVaultActionType.ZapDepositAndStake, SmartVaultActionType.ZapUnstakeAndWithdraw, SmartVaultActionType.ZapWithdrawal];

  // const [finish, setFinish] = useState<boolean>(false);

  const inputProps = { readOnly: true }

  const { query } = useRouter();

  const outputAmount = (Number(inAmount) * Number(inputToken?.price)) /
  Number(outputToken?.price) || 0


  // hardcode preview action steps in vault inputs
  // allow to retry step in error and not only finish
  // update TVL wallet balance after finish
  const executeActionAndUpdateState = async (action: ActionProps) => {
    setStepLoading(true);
    
    var assetBalanceBefore = 0;

    try {
      assetBalanceBefore = Number(await clients.publicClient.readContract({
        address: vaultAsset.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account!],
      }));

      const success = await action.button.action();
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

    // reload actions with balanced updated
    if(action.updateBalanceAfter) {
      let postBal = Number(await clients.publicClient.readContract({
          address: vaultAsset.address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [account!],
      }));

      setActions(
        getActionsByType({
        vaultRouter: VaultRouterByChain[vaultData.chainId],
        actionType,
        vaultData,
        zapAmount: postBal - assetBalanceBefore,
        inputAmount: Number(inAmount),
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
      }))
    }
  }

  useEffect(() => {
  if(visible){
    const useZapProvider = async (value: number, isZapDeposit: boolean) => {
      setZapLoading(true);
      showLoadingToast("Searching for the best price...")
  
      let inputVal = value * (10 ** inputToken!.decimals);
  
      let newZapProvider = zapProvider
      if (isZapDeposit) {
        newZapProvider = await getZapProvider({ 
          sellToken: inputToken!, buyToken: vaultAsset!, amount: Number(inputVal), chainId: vaultData.chainId, account: account! })
      } else {
        newZapProvider = await getZapProvider(
          { sellToken: vaultAsset!, buyToken: outputToken!, amount: Number(inputVal), chainId: vaultData.chainId, account: account! }
        )
      }
  
      if (newZapProvider === ZapProvider.notFound) {
        showErrorToast("Zap not available. Please try a different token or amount")
        setError(true);
      } else {
        showSuccessToast(`Using ${String(ZapProvider[newZapProvider])} for your zap`)
        setZapProvider(newZapProvider);
      }
  
      setZapLoading(false);
  
      setActions(
        getActionsByType({
          vaultRouter: VaultRouterByChain[vaultData.chainId],
          actionType,
          vaultData,
          inputAmount: Number(inAmount),
          inputToken,
          outputToken,
          outputAmount,
          account: account!,
          zapProvider: newZapProvider,
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
    }
  
    if(zapTypes.includes(actionType)) {  
      useZapProvider(Number(inAmount), zapTypes.slice(0,2).includes(actionType));
    } else {
      setActions(
        getActionsByType({
          vaultRouter: VaultRouterByChain[vaultData.chainId],
          actionType,
          vaultData,
          inputAmount: Number(inAmount),
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
    }
  }
  }, [visible])

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
            (zapLoading) &&
            <p className="text-white">Loading up the zap provider..</p>
          }
          {
            (account && !inputToken || (actions.length === 0 && !zapLoading)) &&
            <p className="text-white">Nothing to do here</p>
          }

          <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-5 text-start">
            <div className="w-full">
              {actions.map((action, i) => (
                <div className="p-8">
                  <p className="text-lg">{`${action.id} - ${action.title}`}</p>
                  <p>{action.description}</p>
                  <MainActionButton
                    label={action.button.label}
                    handleClick={() => executeActionAndUpdateState(action)}
                    disabled={zapLoading || stepLoading || error || currentStep !== action.id} />
                </div>
              ))}
            </div>
            {
              ((currentStep === actions.length + 1 && !zapLoading) ||
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