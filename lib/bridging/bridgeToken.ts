import { Address } from "viem";
import axios from "axios";
import { PublicClient, mainnet } from "wagmi";
import { arbitrum, optimism } from "viem/chains";
import { Clients } from "@/lib/types";
import { showLoadingToast, showSuccessToast } from "@/lib/toasts";
import { handleCallResult, simulateCall } from "@/lib/utils/helpers";
import { LockboxAdapterAbi, LockboxAdapterByChain } from "@/lib/constants";

export const DestinationIdByChain: { [key: number]: number } = {
  [mainnet.id]: 6648936,
  [optimism.id]: 1869640809,
  [arbitrum.id]: 1634886255,
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

export default async function bridgeToken({ destination, to, asset, delegate, amount, slippage, callData, account, clients, chainId }: BridgeTokenProps): Promise<boolean> {
  showLoadingToast("Fetching Relayer Fee...");

  console.log({ destination, to, asset, delegate, amount, slippage, callData, account, chainId })

  const { data: relayerFee } = await axios.post(
    "https://sdk-server.mainnet.connext.ninja/estimateRelayerFee", {
    originDomain: DestinationIdByChain[chainId],
    destinationDomain: destination,
  })
  console.log({ relayerFee })

  showSuccessToast("Fetched Relayer Fee!");

  showLoadingToast("Bridging VCX...");

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