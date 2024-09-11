import { AnyToAnyDepositorAbi, LeverageLooperAbi } from "@/lib/constants";
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
  showLoadingToast("Depositing yield tokens...");

  const success = await handleCallResult({
    successMessage: "Deposited yield tokens!",
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
  isYieldToken,
  address,
  account,
  clients,
}: { blockNumber: bigint, isYieldToken: boolean, address: Address, account: Address, clients: Clients }): Promise<boolean> {
  showLoadingToast("Claiming Reserve...");

  const success = await handleCallResult({
    successMessage: "Claimed reserve!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: address, abi: AnyToAnyDepositorAbi },
      functionName: "claimReserved",
      args: [blockNumber, isYieldToken],
      publicClient: clients.publicClient
    }),
    clients
  });

  return success;
}

export async function proposeSlippage({
  slippage,
  address,
  account,
  clients,
}: { slippage: number, address: Address, account: Address, clients: Clients }): Promise<boolean> {
  showLoadingToast("Proposing slippage...");

  const success = await handleCallResult({
    successMessage: "Proposed slippage!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: address, abi: AnyToAnyDepositorAbi },
      functionName: "proposeSlippage",
      args: [BigInt(slippage)],
      publicClient: clients.publicClient
    }),
    clients
  });

  return success;
}

export async function changeSlippage({
  address,
  account,
  clients,
}: { address: Address, account: Address, clients: Clients }): Promise<boolean> {
  showLoadingToast("Change slippage...");

  const success = await handleCallResult({
    successMessage: "Changed slippage!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: address, abi: AnyToAnyDepositorAbi },
      functionName: "changeSlippage",
      publicClient: clients.publicClient
    }),
    clients
  });

  return success;
}

export async function proposeFloat({
  float,
  address,
  account,
  clients,
}: { float: number, address: Address, account: Address, clients: Clients }): Promise<boolean> {
  showLoadingToast("Proposing float...");

  const success = await handleCallResult({
    successMessage: "Proposed float!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: address, abi: AnyToAnyDepositorAbi },
      functionName: "proposeFloatRatio",
      args: [BigInt(float)],
      publicClient: clients.publicClient
    }),
    clients
  });

  return success;
}

export async function changeFloat({
  address,
  account,
  clients,
}: { address: Address, account: Address, clients: Clients }): Promise<boolean> {
  showLoadingToast("Change float...");

  const success = await handleCallResult({
    successMessage: "Changed float!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: address, abi: AnyToAnyDepositorAbi },
      functionName: "changeFloatRatio",
      publicClient: clients.publicClient
    }),
    clients
  });

  return success;
}

export async function adjustLeverage({
  address,
  account,
  clients,
}: { address: Address, account: Address, clients: Clients }): Promise<boolean> {
  showLoadingToast("Adjusting Leverage...");

  const success = await handleCallResult({
    successMessage: "Adjusted leverage!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: address, abi: LeverageLooperAbi },
      functionName: "adjustLeverage",
      publicClient: clients.publicClient
    }),
    clients
  });

  return success;
}