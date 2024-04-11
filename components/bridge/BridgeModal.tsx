import { Dispatch, SetStateAction, useState } from "react";
import Modal from "@/components/modal/Modal";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import MainActionButton from "@/components/button/MainActionButton";
import ActionSteps from "@/components/vault/ActionSteps";
import { safeRound } from "@/lib/utils/formatBigNumber";
import { Address, encodeAbiParameters, formatUnits, parseEther } from "viem";
import { handleCallResult, simulateCall, validateInput } from "@/lib/utils/helpers";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { VCX } from "@/lib/constants";
import { PublicClient, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { AddressByChain, Clients, SmartVaultActionType, Token } from "@/lib/types";
import { ActionStep, getSmartVaultActionSteps } from "@/lib/getActionSteps";
import { handleAllowance } from "@/lib/approve";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { tokensAtom } from "@/lib/atoms";
import { useAtom } from "jotai";

const LockboxAdapterByChain: AddressByChain = {
  1: "0x45bf3c737e57b059a5855280ca1adb8e9606ac68",
  10: "0x81dADc774d2ae44Eb30D2290d076Ae67F9800bd5",
  42161: "0x0B52cA1406eeA3Ce1fcc37dC0121845eF1de3Ae8"
}

const DestinationIdByChain: { [key: number]: number } = {
  1: 6648936,
  10: 1869640809,
  42161: 1634886255
}

const xVCX: Token = {
  address: VCX,
  name: "xVCX",
  symbol: "xVCX",
  decimals: 18,
  logoURI: "",
  balance: 0,
  price: 0,
  totalSupply: 0,
  chainId: 10
}

const demoVCX = {
  address: VCX,
  name: "VCX",
  symbol: "VCX",
  decimals: 18,
  logoURI: "",
  balance: 0,
  price: 0,
  totalSupply: 0,
  chainId: 1
}

interface BridgeTokenProps {
  destination: number;
  to: Address;
  asset: Address;
  delegate: Address;
  amount: bigint;
  slippage: number;
  callData: Address;
  account: Address;
  clients: Clients;
  chainId: number;
}

async function bridgeToken({ destination, to, asset, delegate, amount, slippage, callData, account, clients, chainId }: BridgeTokenProps): Promise<boolean> {
  return handleCallResult({
    successMessage: "VCX bridged successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: LockboxAdapterByChain[chainId],
        abi: LockboxAdapterAbi,
      },
      functionName: "exercise",
      publicClient: clients.publicClient as PublicClient,
      args: [destination, to, asset, delegate, amount, slippage, callData],
    }),
    clients,
  });
}


export default function BridgeModal({ show }: { show: [boolean, Dispatch<SetStateAction<boolean>>] }): JSX.Element {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();

  const [tokens, setTokens] = useAtom(tokensAtom)

  const [activeTab, setActiveTab] = useState<string>("OP -> ETH")
  const [chainId, setChainId] = useState<number>(10)
  const [inputAmount, setInputAmount] = useState<string>("0");

  const [stepCounter, setStepCounter] = useState<number>(0);
  const [steps, setSteps] = useState<ActionStep[]>(
    getSmartVaultActionSteps(SmartVaultActionType.Deposit)
  );

  function switchTab(newTab: string) {
    setStepCounter(0);
    setSteps(getSmartVaultActionSteps(SmartVaultActionType.Deposit))
    setInputAmount("0")

    if (newTab === "OP -> ETH") {
      setChainId(10)
    } else {
      setChainId(42161)
    }

    setActiveTab(newTab)
  }

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value;
    setInputAmount(validateInput(value).isValid ? value : "0");
  }

  function handleMaxClick() {
    if (!xVCX) return;
    const stringBal = xVCX.balance.toLocaleString("fullwide", {
      useGrouping: false,
    });
    const rounded = safeRound(BigInt(stringBal), xVCX.decimals);
    const formatted = formatUnits(rounded, xVCX.decimals);
    handleChangeInput({ currentTarget: { value: formatted } });
  }

  async function handleMainAction() {
    let val = Number(inputAmount)
    if (val === 0 || !account || !walletClient) return;
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
          token: xVCX.address,
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
          to: account!,
          asset: xVCX.address,
          delegate: account!,
          amount: parseEther(
            Number(val).toLocaleString("fullwide", { useGrouping: false })
          ),
          slippage: 0,
          callData: encodeAbiParameters([{ name: "recipient", type: "address" }], [account!]),
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
            chainId={10}
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
              Note that bridging is performed in batches. It might take up to 3 hours before you receive the tokens in your wallet.
            </p>
          </div>
          <div className="mt-6">
            <MainActionButton
              label="Bridge"
              handleClick={handleMainAction}
            />
          </div>
        </>
      }
    </Modal>
  )
}

const LockboxAdapterAbi = [{ "inputs": [{ "internalType": "address", "name": "_connext", "type": "address" }, { "internalType": "address", "name": "_registry", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "AmountLessThanZero", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }], "name": "Forwarder__is__not__Adapter", "type": "error" }, { "inputs": [], "name": "IXERC20Adapter_WithdrawFailed", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }], "name": "NotConnext", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "ValueLessThanAmount", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bytes", "name": "_lowLevelData", "type": "bytes" }], "name": "LockBoxWithdrawFailed", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "address", "name": "_asset", "type": "address" }, { "internalType": "address", "name": "_recipient", "type": "address" }], "name": "handlexReceive", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "address", "name": "_asset", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint32", "name": "", "type": "uint32" }, { "internalType": "bytes", "name": "_callData", "type": "bytes" }], "name": "xReceive", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint32", "name": "_destination", "type": "uint32" }, { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "address", "name": "_asset", "type": "address" }, { "internalType": "address", "name": "_delegate", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "uint256", "name": "_slippage", "type": "uint256" }, { "internalType": "bytes", "name": "_callData", "type": "bytes" }], "name": "xcall", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "payable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }] as const