import { Address } from "viem";
import { MinterAbi, OptionTokenAbi, OptionTokenByChain } from "@/lib/constants";
import { Clients } from "@/lib/types";
import { handleCallResult, simulateCall } from "@/lib/utils/helpers";
import { PublicClient } from "wagmi";

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
  });
}

interface ClaimOPopProps {
  gauges: Address[];
  account: Address;
  minter: Address;
  clients: Clients
}

export async function claimOPop({ gauges, account, minter, clients }: ClaimOPopProps): Promise<boolean> {
  return handleCallResult({
    successMessage: "oVCX Succesfully Claimed!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: minter,
        abi: MinterAbi,
      },
      functionName: "mintMany",
      publicClient: clients.publicClient as PublicClient,
      args: [gauges],
    }),
    clients,
  });
}
