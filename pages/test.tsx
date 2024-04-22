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
import { VCX, XVCXByChain } from "@/lib/constants";
import { PublicClient, sepolia, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { AddressByChain, Clients, SmartVaultActionType, Token } from "@/lib/types";
import { ActionStep, getSmartVaultActionSteps } from "@/lib/getActionSteps";
import { handleAllowance } from "@/lib/approve";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { tokensAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { arbitrum, arbitrumSepolia, mainnet, optimism } from "viem/chains";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import axios from "axios";
import { showLoadingToast } from "@/lib/toasts";

const LockboxAdapterByChain: AddressByChain = {
  1: "0x45bf3c737e57b059a5855280ca1adb8e9606ac68",
  10: "0x81dADc774d2ae44Eb30D2290d076Ae67F9800bd5",
  42161: "0x0B52cA1406eeA3Ce1fcc37dC0121845eF1de3Ae8",
  [sepolia.id]: "0x445fbf9cCbaf7d557fd771d56937E94397f43965",
  [arbitrumSepolia.id]: "0x1780Ac087Cbe84CA8feb75C0Fb61878971175eb8"
}

const DestinationIdByChain: { [key: number]: number } = {
  1: 6648936,
  10: 1869640809,
  42161: 1634886255,
  [sepolia.id]: 1936027759,
  [arbitrumSepolia.id]: 1633842021
}

const lockbox = "0x0658276359Dae13BE1E991076cD957ABFBA94f15"


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

interface BridgeTokenProps {
  destination: number;
  to: Address;
  asset: Address;
  delegate: Address;
  amount: bigint;
  slippage: number;
  callData: string;
  account: Address;
  clients: Clients;
  chainId: number;
}

async function bridgeToken({ destination, to, asset, delegate, amount, slippage, callData, account, clients, chainId }: BridgeTokenProps): Promise<boolean> {
  showLoadingToast("Bridging VCX...");

  const { data: relayerFee } = await axios.post(
    "https://sdk-server.mainnet.connext.ninja/estimateRelayerFee", {
    originDomain: DestinationIdByChain[chainId],
    destinationDomain: destination,
  })

  return handleCallResult({
    successMessage: "VCX bridged successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: LockboxAdapterByChain[chainId],
        abi: LockboxAdapterAbi,
      },
      functionName: "xcall",
      publicClient: clients.publicClient as PublicClient,
      args: [destination, to, asset, delegate, amount, slippage, callData],
      value: BigInt(relayerFee.hex)
    }),
    clients,
  });
}

export default function Test() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();

  const [chainId, setChainId] = useState<number>(mainnet.id)
  const [destChainId, setDestChainId] = useState<number>(arbitrum.id)

  const [stepCounter, setStepCounter] = useState<number>(0);

  const inputAmount = "10"

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

    let success = false;
    switch (stepCounter) {
      case 0:
        success = await handleAllowance({
          token: XVCXByChain[chainId],
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
          destination: DestinationIdByChain[destChainId],
          to: account!,
          asset: XVCXByChain[chainId],
          delegate: account!,
          amount: BigInt(
            Number(val).toLocaleString("fullwide", { useGrouping: false })
          ),
          slippage: 0,
          callData: encodeAbiParameters([{ name: "recipient", type: "address" }], [account!]),
          account: account!,
          clients: { publicClient, walletClient: walletClient! },
          chainId
        });
        break;
    }

    setStepCounter(stepCounter + 1);
  }

  return <div className="text-white">
    <div className="border-b border-gray-500 pb-4">
      <h1>Bridge {chainId === mainnet.id ? "From ETH to ARB" : "From ARB to ETH"}</h1>
      <p>Step {stepCounter}</p>
      <div className="flex flex-row space-x-4">
        <MainActionButton
          label={stepCounter === 0 ? "Approve" : "Bridge"}
          handleClick={handleMainAction}
        />
        <SecondaryActionButton
          label="Switch Direction"
          handleClick={() => {
            const _chainId = chainId;
            setChainId(destChainId)
            setDestChainId(_chainId)
          }}
        />
      </div>
    </div>
  </div>
}


const LockboxAdapterAbi = [{ "inputs": [{ "internalType": "address", "name": "_connext", "type": "address" }, { "internalType": "address", "name": "_registry", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "AmountLessThanZero", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }], "name": "Forwarder__is__not__Adapter", "type": "error" }, { "inputs": [], "name": "IXERC20Adapter_WithdrawFailed", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }], "name": "NotConnext", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "ValueLessThanAmount", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bytes", "name": "_lowLevelData", "type": "bytes" }], "name": "LockBoxWithdrawFailed", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "address", "name": "_asset", "type": "address" }, { "internalType": "address", "name": "_recipient", "type": "address" }], "name": "handlexReceive", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "address", "name": "_asset", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint32", "name": "", "type": "uint32" }, { "internalType": "bytes", "name": "_callData", "type": "bytes" }], "name": "xReceive", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint32", "name": "_destination", "type": "uint32" }, { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "address", "name": "_asset", "type": "address" }, { "internalType": "address", "name": "_delegate", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "uint256", "name": "_slippage", "type": "uint256" }, { "internalType": "bytes", "name": "_callData", "type": "bytes" }], "name": "xcall", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "payable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }] as const