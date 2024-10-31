import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import MainActionButton from "@/components/button/MainActionButton";
import ActionSteps from "@/components/vault/ActionSteps";
import { NumberFormatter, safeRound } from "@/lib/utils/formatBigNumber";
import { encodeAbiParameters, formatUnits } from "viem";
import { handleSwitchChain, validateInput } from "@/lib/utils/helpers";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { LockboxAdapterByChain, VCX, WVCXByChain, XVCXByChain } from "@/lib/constants/addresses";
import { SmartVaultActionType, Token } from "@/lib/types";
import { ActionStep, getSmartVaultActionSteps } from "@/lib/getActionSteps";
import { handleAllowance } from "@/lib/approve";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { tokensAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import bridgeToken, { DestinationIdByChain } from "@/lib/bridging/bridgeToken";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { mainnet } from "viem/chains";
import SecondaryActionButton from "../button/SecondaryActionButton";
import { useRouter } from "next/router";

export default function BridgeModal({ show }: { show: [boolean, Dispatch<SetStateAction<boolean>>] }): JSX.Element {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address: account, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const router = useRouter();

  const [tokens, setTokens] = useAtom(tokensAtom)

  const [xVCX, setXVCX] = useState<Token>()
  const [wVCX, setWVCX] = useState<Token>()

  const [activeTab, setActiveTab] = useState<string>("OP -> ETH")
  const [chainId, setChainId] = useState<number>(10)
  const [inputAmount, setInputAmount] = useState<string>("0");

  const [stepCounter, setStepCounter] = useState<number>(0);
  const [steps, setSteps] = useState<ActionStep[]>(
    getSmartVaultActionSteps(SmartVaultActionType.Deposit)
  );

  useEffect(() => {
    if (Object.keys(tokens).length > 0 && Object.keys(tokens[10]).length > 0) {
      setXVCX(tokens[10][XVCXByChain[10]])
      setWVCX(tokens[10][WVCXByChain[10]])
    }
  }, [account, tokens])

  function switchTab(newTab: string) {
    setStepCounter(0);
    setSteps(getSmartVaultActionSteps(SmartVaultActionType.Deposit))
    setInputAmount("0")

    if (newTab === "OP -> ETH") {
      setChainId(10)
      setXVCX(tokens[10][XVCXByChain[10]])
      setWVCX(tokens[10][WVCXByChain[10]])
    } else {
      setChainId(42161)
      setXVCX(tokens[42161][XVCXByChain[42161]])
      setWVCX(tokens[42161][WVCXByChain[42161]])
    }

    setActiveTab(newTab)
  }

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value;
    setInputAmount(validateInput(value).isValid ? value : "0");
  }

  function handleMaxClick() {
    if (!xVCX) return

    const stringBal = xVCX.balance.toLocaleString("fullwide", {
      useGrouping: false,
    });
    const rounded = safeRound(BigInt(stringBal), xVCX.decimals);
    const formatted = formatUnits(rounded, xVCX.decimals);
    handleChangeInput({ currentTarget: { value: formatted } });
  }

  async function handleMainAction() {
    let val = Number(inputAmount)
    if (val === 0 || !account || !walletClient || !xVCX) return;
    val = val * (10 ** xVCX.decimals)

    if (chain?.id !== Number(chainId)) {
      try {
        await switchChainAsync?.({ chainId: Number(chainId) });
      } catch (error) {
        return;
      }
    }

    const stepsCopy = [...steps];
    const currentStep = stepsCopy[stepCounter];
    currentStep.loading = true;
    setSteps(stepsCopy);

    let success = false;
    switch (stepCounter) {
      case 0:
        success = await handleAllowance({
          token: chainId === mainnet.id ? VCX : XVCXByChain[chainId],
          amount: val,
          account: account!,
          spender: LockboxAdapterByChain[chainId],
          clients: {
            publicClient: publicClient!,
            walletClient: walletClient!,
          },
        });
        break;
      case 1:
        success = await bridgeToken({
          destination: DestinationIdByChain[1],
          to: chainId === mainnet.id ? account! : LockboxAdapterByChain[mainnet.id],
          asset: XVCXByChain[chainId],
          delegate: account!,
          amount: BigInt(
            Number(val).toLocaleString("fullwide", { useGrouping: false })
          ),
          slippage: 0,
          callData: chainId === mainnet.id ? "0x" : encodeAbiParameters([{ name: "recipient", type: "address" }], [account!]),
          account: account!,
          clients: { publicClient: publicClient!, walletClient: walletClient! },
          chainId
        });
        if (success) {
          await mutateTokenBalance({
            tokensToUpdate: [xVCX.address],
            account,
            tokensAtom: [tokens, setTokens],
            chainId
          })
        }
        break;
    }

    currentStep.loading = false;
    currentStep.success = success;
    currentStep.error = !success;
    const newStepCounter = stepCounter + 1;
    setSteps(stepsCopy);
    setStepCounter(newStepCounter);
  }

  return (
    <Modal visibility={show} title={<h2 className="text-2xl font-bold">Bridge VCX</h2>}>
      <TabSelector
        className="mb-6"
        availableTabs={["OP -> ETH", "ARB -> ETH"]}
        activeTab={activeTab}
        setActiveTab={switchTab}
      />
      {
        Object.keys(tokens).length > 0 && xVCX?.address && wVCX?.address &&
        <>
          <div className="text-start ">
            <div className="mt-4 w-full bg-customNeutral300 bg-opacity-30 border border-customNeutral100 rounded-lg p-4">
              <h3 className="text-lg font-bold">wVCX</h3>
              <div className="flex flex-row gap-4">
                <p className="w-2/3">You have <b>{NumberFormatter.format(wVCX.balance / (10 ** wVCX.decimals))} wVCX</b>. Bridge it via wormhole with unparalled security and speed. Tokens are on average transfered in under 30 minutes on Portal.</p>
                <div className="w-1/3 flex flex-row gap-4">
                  <MainActionButton label="Bridge wVCX" handleClick={() => router.push("https://portalbridge.com/")} />
                </div>
              </div>
            </div>
            <div className="mt-4 w-full bg-customNeutral300 bg-opacity-30 border border-customNeutral100 rounded-lg p-4">
              <h3 className="text-lg font-bold">xVCX</h3>
              <div className="flex flex-row gap-4">
                <p className="w-2/3">You have <b>{NumberFormatter.format(xVCX.balance / (10 ** xVCX.decimals))}</b> xVCX. xVCX is no longer actively used but you can still bridge it to ethereum and redeem it for VCX.</p>
                <div className="w-1/3 flex flex-row gap-4">
                  <SecondaryActionButton
                    label="Bridge xVCX"
                    handleClick={() => router.push(activeTab === "OP -> ETH" ?
                      "https://bridge.connext.network/VCX-from-optimism-to-ethereum?symbol=VCX"
                      : "https://bridge.connext.network/VCX-from-arbitrum-to-ethereum?symbol=VCX")}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      }
    </Modal >
  )
}