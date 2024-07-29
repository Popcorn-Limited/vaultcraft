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

const LOAN_TABS = ["Preview"]

export default function PreviewInterface({ visibilityState, vaultData, inAmount, outputToken, inputToken, gauge, vault, actionType }: {
  visibilityState: [boolean, Dispatch<SetStateAction<boolean>>],
  vaultData: VaultData,
  actionType: SmartVaultActionType,
  inAmount: [string, Dispatch<SetStateAction<string>>],
  outputToken: Token,
  gauge?: Token,
  vault: Token,
  inputToken: Token
}): JSX.Element {
  const [visible, setVisible] = visibilityState
  const [input, setInput] = inAmount;
  const action = actionType;

  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync } = useSwitchChain();

  const [activeTab, setActiveTab] = useState<string>("Supply")

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>([]);

  const [zapProvider, setZapProvider] = useState(ZapProvider.none)

  const [slippage, setSlippage] = useState<number>(100); // In BPS 0 - 10_000
  const [tradeTimeout, setTradeTimeout] = useState<number>(300); // number of seconds a cow order is valid for
  const [tokens, setTokens] = useAtom(tokensAtom);
  const [vaults, setVaults] = useAtom(vaultsAtom);

  // const [finish, setFinish] = useState<boolean>(false);

  const inputProps = { readOnly: true }

  const { query } = useRouter();

  useEffect(() => {
    setActiveTab(action === SmartVaultActionType.DepositAndStake ? "Deposit" : "Withdraw");
    setStepCounter(0);
    setSteps(getSmartVaultActionSteps(action));
  }, [visible, input])

  // print one card for each step with data
  // highlight current step one
  // use small cards with no inputs, just recaps
  async function handleMainAction() {
    let val = Number(input)
    let chainId = vaultData.chainId;

    if (val === 0 || !inputToken || !outputToken || !inputToken || !vaultData.vault || !account || !walletClient) return;
    val = val * (10 ** inputToken.decimals)

    if (chain?.id !== Number(chainId)) {
      try {
        await switchChainAsync?.({ chainId: Number(chainId) });
      } catch (error) {
        return;
      }
    }

    let newZapProvider = zapProvider
    // if (newZapProvider === ZapProvider.none && [SmartVaultActionType.ZapDeposit, SmartVaultActionType.ZapDepositAndStake, SmartVaultActionType.ZapUnstakeAndWithdraw, SmartVaultActionType.ZapWithdrawal].includes(action)) {
    //   showLoadingToast("Searching for the best price...")
    //   if ([SmartVaultActionType.ZapDeposit, SmartVaultActionType.ZapDepositAndStake].includes(action)) {
    //     newZapProvider = await getZapProvider({ sellToken: inputToken, buyToken: ou, amount: val, chainId, account })
    //   } else {
    //     newZapProvider = await getZapProvider({ sellToken: asset, buyToken: outputToken, amount: val, chainId, account })
    //   }

    //   setZapProvider(newZapProvider)

    //   if (newZapProvider === ZapProvider.notFound) {
    //     showErrorToast("Zap not available. Please try a different token.")
    //     return
    //   } else {
    //     showSuccessToast(`Using ${String(ZapProvider[newZapProvider])} for your zap`)
    //   }
    // }

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
      asset: inputToken,
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

      // const vaultTVL = SUPPORTED_NETWORKS.map(chain => newVaults[chain.id]).flat().reduce((a, b) => a + b.tvl, 0)
      // setTVL({
      //   vault: vaultTVL,
      //   lockVault: tvl.lockVault,
      //   stake: tvl.stake,
      //   total: vaultTVL + tvl.lockVault + tvl.stake
      // });

      // const vaultNetworth = SUPPORTED_NETWORKS.map(chain =>
      //   Object.values(tokens[chain.id])).flat().filter(t => t.type === TokenType.Vault || t.type === TokenType.Gauge)
      //   .reduce((a, b) => a + ((b.balance / (10 ** b.decimals)) * b.price), 0)
      // const assetNetworth = SUPPORTED_NETWORKS.map(chain =>
      //   Object.values(tokens[chain.id])).flat().filter(t => t.type === TokenType.Asset)
      //   .reduce((a, b) => a + ((b.balance / (10 ** b.decimals)) * b.price), 0)

      // setNetworth({
      //   vault: vaultNetworth,
      //   lockVault: networth.lockVault,
      //   wallet: assetNetworth,
      //   stake: networth.stake,
      //   total: vaultNetworth + assetNetworth + networth.lockVault + networth.stake
      // })
    }
  }

  const handleRefresh = async () => {
    setActiveTab(action === SmartVaultActionType.DepositAndStake ? "Deposit" : "Withdraw");
    setStepCounter(0);
    setSteps(getSmartVaultActionSteps(action));
  }

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
            (account && !inputToken) &&
            <p className="text-white">Nothing to do here</p>
          }

          <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-5 text-start">
            <div className="w-full flex justify-center my-6">
              <ActionSteps 
              steps={steps} 
              stepCounter={stepCounter} inputAmount={input} inputToken={inputToken} outputToken={outputToken}
              chainId={vaultData.chainId}/>
            </div>
            <div className="">
              {account ? (
                <>
                  {stepCounter === steps.length ||
                    steps.some((step) => !step.loading && step.error) ? (
                    <div>
                      <MainActionButton label={"Finish"} handleClick={() => { setVisible(false); }} />
                      <MainActionButton label={"Start Over"} handleClick={handleRefresh} />
                    </div>
                  ) : (
                    <MainActionButton
                      label={steps[stepCounter].label}
                      handleClick={handleMainAction}
                      disabled={input === "0" || steps[stepCounter].loading}
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
          </div>
        </div>
      </div>
    </Modal>
  </>
}