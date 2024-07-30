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
import ActionSteps from "@/components/vault/ActionSteps";
import { getZapProvider } from "@/lib/vault/zap";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts";
import handleVaultInteraction from "@/lib/vault/handleVaultInteraction";
import { useRouter } from "next/router";
import { handleAllowance } from "@/lib/approve";
import { VaultRouterByChain } from "@/lib/constants";

export default function PreviewInterface({ visibilityState, vaultData, inAmount, outputToken, inputToken, gauge, vault, actionType, asset }: {
  visibilityState: [boolean, Dispatch<SetStateAction<boolean>>],
  vaultData: VaultData,
  actionType: SmartVaultActionType,
  inAmount: string,
  outputToken: Token,
  gauge?: Token,
  vault: Token,
  inputToken: Token,
  asset: Token,
}): JSX.Element {
  const [visible, setVisible] = visibilityState;
  //const [amount, setAmount] = inAmount

  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync } = useSwitchChain();

  const [actions, setActions] = useState<any[]>([]);


  useEffect(() => {
    if (!account) return

    const clients = { publicClient: publicClient!, walletClient: walletClient! }

    setActions([
      {
        title: "1. Approve Zap",
        description: `Approve ${inAmount} ${inputToken.symbol} for zapping`,
        button: {
          label: "Approve",
          action: () => handleAllowance({
            token: inputToken.address,
            amount: Number(inAmount),
            account,
            spender: VaultRouterByChain[vaultData.chainId],
            clients
          })
        }
      },
      {
        title: "2. Zap",
        description: `Zap ${inAmount} ${inputToken.symbol} for ${asset.symbol}`,
        button: {
          label: "Zap",
          action: () => zap({
            token: inputToken.address,
            amount: Number(inAmount),
            account,
            spender: VaultRouterByChain[vaultData.chainId],
            clients
          })
        }
      },
      {
        title: "3. Approve Deposit",
        description: `Approve ${inAmount} ${asset.symbol} to deposit into the vault`,
        button: {
          label: "Approve",
          action: () => handleAllowance({
            token: inputToken.address,
            amount: Number(inAmount),
            account,
            spender: VaultRouterByChain[vaultData.chainId],
            clients
          })
        }
      },
      {
        title: "4. Deposit",
        description: `Deposit ${inAmount} ${asset.symbol} into the vault`,
        button: {
          label: "Deposit",
          action: () => handleAllowance({
            token: inputToken.address,
            amount: Number(inAmount),
            account,
            spender: VaultRouterByChain[vaultData.chainId],
            clients
          })
        }
      },
    ])
  }, [account, actionType, inAmount])

  // print one card for each step with data
  // highlight current step one
  // use small cards with no inputs, just recaps
  // async function handleMainAction() {
  //   let val = Number(input)
  //   let chainId = vaultData.chainId;

  //   if (val === 0 || !inputToken || !outputToken || !inputToken || !vaultData.vault || !account || !walletClient) return;
  //   val = val * (10 ** inputToken.decimals)

  //   if (chain?.id !== Number(chainId)) {
  //     try {
  //       await switchChainAsync?.({ chainId: Number(chainId) });
  //     } catch (error) {
  //       return;
  //     }
  //   }

  //   let newZapProvider = zapProvider
  //   // if (newZapProvider === ZapProvider.none && [SmartVaultActionType.ZapDeposit, SmartVaultActionType.ZapDepositAndStake, SmartVaultActionType.ZapUnstakeAndWithdraw, SmartVaultActionType.ZapWithdrawal].includes(action)) {
  //   //   showLoadingToast("Searching for the best price...")
  //   //   if ([SmartVaultActionType.ZapDeposit, SmartVaultActionType.ZapDepositAndStake].includes(action)) {
  //   //     newZapProvider = await getZapProvider({ sellToken: inputToken, buyToken: ou, amount: val, chainId, account })
  //   //   } else {
  //   //     newZapProvider = await getZapProvider({ sellToken: asset, buyToken: outputToken, amount: val, chainId, account })
  //   //   }

  //   //   setZapProvider(newZapProvider)

  //   //   if (newZapProvider === ZapProvider.notFound) {
  //   //     showErrorToast("Zap not available. Please try a different token.")
  //   //     return
  //   //   } else {
  //   //     showSuccessToast(`Using ${String(ZapProvider[newZapProvider])} for your zap`)
  //   //   }
  //   // }

  //   const stepsCopy = [...steps]
  //   const currentStep = stepsCopy[stepCounter]
  //   currentStep.loading = true
  //   setSteps(stepsCopy)

  //   const vaultInteraction = await handleVaultInteraction({
  //     action,
  //     stepCounter,
  //     chainId,
  //     amount: val,
  //     inputToken,
  //     outputToken,
  //     vaultData,
  //     asset: inputToken,
  //     vault,
  //     gauge,
  //     account,
  //     zapProvider: newZapProvider,
  //     slippage,
  //     tradeTimeout,
  //     clients: { publicClient: publicClient!, walletClient },
  //     referral:
  //       !!query?.ref && isAddress(query.ref as string)
  //         ? getAddress(query.ref as string)
  //         : undefined,
  //     tokensAtom: [tokens, setTokens]
  //   });
  //   const success = await vaultInteraction();

  //   currentStep.loading = false;
  //   currentStep.success = success;
  //   currentStep.error = !success;

  //   const newStepCounter = stepCounter + 1;
  //   setSteps(stepsCopy);
  //   setStepCounter(newStepCounter);

  //   if (newStepCounter === steps.length && success) {
  //     const newSupply = await publicClient?.readContract({
  //       address: vaultData.address,
  //       abi: erc20Abi,
  //       functionName: "totalSupply"
  //     })
  //     const index = vaults[vaultData.chainId].findIndex(v => v.address === vaultData.address)
  //     const newNetworkVaults = [...vaults[vaultData.chainId]]
  //     newNetworkVaults[index] = {
  //       ...vaultData,
  //       totalSupply: Number(newSupply),
  //       tvl: (Number(newSupply) * vault.price) / (10 ** vault.decimals)
  //     }
  //     const newVaults = { ...vaults, [vaultData.chainId]: newNetworkVaults }

  //     setVaults(newVaults)

  //     // const vaultTVL = SUPPORTED_NETWORKS.map(chain => newVaults[chain.id]).flat().reduce((a, b) => a + b.tvl, 0)
  //     // setTVL({
  //     //   vault: vaultTVL,
  //     //   lockVault: tvl.lockVault,
  //     //   stake: tvl.stake,
  //     //   total: vaultTVL + tvl.lockVault + tvl.stake
  //     // });

  //     // const vaultNetworth = SUPPORTED_NETWORKS.map(chain =>
  //     //   Object.values(tokens[chain.id])).flat().filter(t => t.type === TokenType.Vault || t.type === TokenType.Gauge)
  //     //   .reduce((a, b) => a + ((b.balance / (10 ** b.decimals)) * b.price), 0)
  //     // const assetNetworth = SUPPORTED_NETWORKS.map(chain =>
  //     //   Object.values(tokens[chain.id])).flat().filter(t => t.type === TokenType.Asset)
  //     //   .reduce((a, b) => a + ((b.balance / (10 ** b.decimals)) * b.price), 0)

  //     // setNetworth({
  //     //   vault: vaultNetworth,
  //     //   lockVault: networth.lockVault,
  //     //   wallet: assetNetworth,
  //     //   stake: networth.stake,
  //     //   total: vaultNetworth + assetNetworth + networth.lockVault + networth.stake
  //     // })
  //   }
  // }

  return <>
    <Modal
      visibility={visibilityState}
      title={"title"}
    >
      <div className="w-full">
        <div className="w-full">
          {actions.map(action =>
            <div>
              <p className="text-lg">{action.title}</p>
              <p>{action.description}</p>
              <MainActionButton label={action.button.label} handleClick={action.button.action} />
            </div>
          )}
        </div>
      </div>
    </Modal>
  </>
}