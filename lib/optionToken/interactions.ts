import { Address } from "viem";
import { ChildGaugeFactoryAbi, MinterAbi, OptionTokenAbi, OptionTokenByChain } from "@/lib/constants";
import { Clients } from "@/lib/types";
import { handleCallResult, simulateCall } from "@/lib/utils/helpers";
import { PublicClient, mainnet } from "wagmi";

interface ExerciseOPopProps {
  amount: bigint;
  maxPaymentAmount: bigint;
  address: Address,
  account: Address;
  clients: Clients;
}

export async function exerciseOPop({
  amount,
  maxPaymentAmount,
  address,
  account,
  clients,
}: ExerciseOPopProps): Promise<boolean> {
  return handleCallResult({
    successMessage: "oVCX exercised successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: address,
        abi: OptionTokenAbi,
      },
      functionName: "exercise",
      publicClient: clients.publicClient as PublicClient,
      args: [amount, maxPaymentAmount, account],
    }),
    clients,
    user: account,
    target: address, 
    functionName: "exercise"
  });
}

interface ClaimOPopProps {
  gauges: Address[];
  chainId: number;
  account: Address;
  minter: Address;
  clients: Clients
}

export async function claimOPop({ gauges, chainId, account, minter, clients }: ClaimOPopProps): Promise<boolean> {

  return handleCallResult({
    successMessage: "oVCX Succesfully Claimed!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: minter,
        abi: chainId === mainnet.id ? MinterAbi : ChildGaugeFactoryAbi,
      },
      functionName: chainId === mainnet.id ? "mintMany" : "mint_many",
      publicClient: clients.publicClient,
      args: [gauges],
    }),
    clients,
    user: account,
    target: minter, 
    functionName: chainId === mainnet.id ? "mintMany" : "mint_many"
  });
}
