import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import MainActionButton from "@/components/button/MainActionButton";
import ActionSteps from "@/components/vault/ActionSteps";
import { safeRound } from "@/lib/utils/formatBigNumber";
import { Address, encodeAbiParameters, formatUnits, parseEther } from "viem";
import { handleCallResult, simulateCall, validateInput } from "@/lib/utils/helpers";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { LockboxAdapterByChain, VCX, XVCXByChain } from "@/lib/constants";
import { PublicClient, mainnet, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { AddressByChain, Clients, SmartVaultActionType, Token } from "@/lib/types";
import { ActionStep, getSmartVaultActionSteps } from "@/lib/getActionSteps";
import { handleAllowance } from "@/lib/approve";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { tokensAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import bridgeToken, { DestinationIdByChain } from "@/lib/bridging/bridgeToken";

export default function BridgeModal({ show }: { show: [boolean, Dispatch<SetStateAction<boolean>>] }): JSX.Element {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();

  const [tokens, setTokens] = useAtom(tokensAtom)

  const [xVCX, setXVCX] = useState<Token>()

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
    }
  }, [account, tokens])

  function switchTab(newTab: string) {
    setStepCounter(0);
    setSteps(getSmartVaultActionSteps(SmartVaultActionType.Deposit))
    setInputAmount("0")

    if (newTab === "OP -> ETH") {
      setChainId(10)
      setXVCX(tokens[10][XVCXByChain[10]])
    } else {
      setChainId(42161)
      setXVCX(tokens[42161][XVCXByChain[42161]])
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
        await switchNetworkAsync?.(Number(chainId));
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
            publicClient,
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
          clients: { publicClient, walletClient: walletClient! },
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
    <Modal visibility={show}>
      <TabSelector
        className="mb-6"
        availableTabs={["OP -> ETH", "ARB -> ETH"]}
        activeTab={activeTab}
        setActiveTab={switchTab}
      />
      {
        Object.keys(tokens).length > 0 &&
        <>
          <InputTokenWithError
            captionText={"Bridge Amount"}
            onSelectToken={() => { }}
            onMaxClick={handleMaxClick}
            chainId={chainId}
            value={inputAmount}
            onChange={handleChangeInput}
            selectedToken={xVCX}
            errorMessage={""}
            tokenList={[]}
            allowSelection={false}
            allowInput
          />
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-customGray500" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-customNeutral200 px-4">
                <ArrowDownIcon
                  className="h-10 w-10 p-2 text-customGray500 border border-customGray500 rounded-full cursor-pointer hover:text-white hover:border-white"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
          <InputTokenWithError
            captionText={"Output Amount"}
            onSelectToken={() => { }}
            onMaxClick={() => { }}
            chainId={1}
            value={inputAmount}
            onChange={() => { }}
            selectedToken={tokens[1][VCX]}
            errorMessage={""}
            tokenList={[]}
            allowSelection={false}
            allowInput={false}
          />
          <div className="w-full flex justify-center my-6">
            <ActionSteps steps={steps} stepCounter={stepCounter} />
          </div>
          <div className="w-full bg-primaryYellow bg-opacity-30 border border-primaryYellow rounded-lg p-4">
            <p className="text-primaryYellow">
              Note that bridging is performed in batches. It might take up to 12 hours before you receive the tokens in your wallet.
            </p>
          </div>
          <div className="mt-6">
            <MainActionButton
              label="Bridge"
              handleClick={handleMainAction}
            />
          </div>
          <p className="text-start mt-4">
            If you encounter issues with this interface try using {" "}
            <a href={
              activeTab === "OP -> ETH" ?
                "https://bridge.connext.network/VCX-from-optimism-to-ethereum?symbol=VCX"
                : "https://bridge.connext.network/VCX-from-arbitrum-to-ethereum?symbol=VCX"
            }
              target="_blank"
              className="text-secondaryBlue">
              Connext
            </a>
            {" "} directly
          </p>
        </>
      }
    </Modal >
  )
}