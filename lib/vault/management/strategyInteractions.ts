import { AnyToAnyDepositorAbi } from "@/lib/constants";
import { showLoadingToast } from "@/lib/toasts";
import { Clients } from "@/lib/types";
import { handleCallResult, simulateCall } from "@/lib/utils/helpers";
import { Address } from "viem";

export async function pushFunds({
  amount,
  address,
  account,
  clients,
}: { amount: number, address: Address, account: Address, clients: Clients }): Promise<boolean> {
  showLoadingToast("Depositing yieldAssets...");

  const success = await handleCallResult({
    successMessage: "Deposited yieldAssets!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: address, abi: AnyToAnyDepositorAbi },
      functionName: "pushFunds",
      args: [BigInt(
        Number(amount).toLocaleString("fullwide", { useGrouping: false })
      ),
        ""],
      publicClient: clients.publicClient
    }),
    clients
  });

  return success;
}

export async function pullFunds({
  amount,
  address,
  account,
  clients,
}: { amount: number, address: Address, account: Address, clients: Clients }): Promise<boolean> {
  showLoadingToast("Depositing assets...");
  const success = await handleCallResult({
    successMessage: "Deposited assets!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: address, abi: AnyToAnyDepositorAbi },
      functionName: "pullFunds",
      args: [BigInt(
        Number(amount).toLocaleString("fullwide", { useGrouping: false })
      ),
        ""],
      publicClient: clients.publicClient
    }),
    clients
  });

  return success;
}

export async function claimReserve({
  blockNumber,
  isYieldAsset,
  address,
  account,
  clients,
}: { blockNumber: bigint, isYieldAsset: boolean, address: Address, account: Address, clients: Clients }): Promise<boolean> {
  showLoadingToast("Claiming Reserve...");
  const success = await handleCallResult({
    successMessage: "Claimed reserve!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: address, abi: AnyToAnyDepositorAbi },
      functionName: "claimReserved",
      args: [blockNumber, isYieldAsset],
      publicClient: clients.publicClient
    }),
    clients
  });

  return success;
}