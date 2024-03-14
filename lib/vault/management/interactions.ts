import { VaultAbi, VaultControllerAbi } from "@/lib/constants";
import { showLoadingToast } from "@/lib/toasts";
import { Clients, SimulationResponse, VaultData } from "@/lib/types";
import { handleCallResult } from "@/lib/utils/helpers";
import { Address, PublicClient } from "viem";

interface BaseWriteProps {
  vaultData: VaultData;
  account?: Address;
  clients: Clients;
}

interface VaultControllerSimulateProps {
  account: Address;
  args: any[];
  functionName: string;
  publicClient: PublicClient;
  chainId: number;
}

interface VaultSimulateProps {
  address: Address;
  account: Address;
  functionName: string;
  publicClient: PublicClient;
}

const VAULT_CONTROLLER_ADDRESS: { [key: number]: Address } = {
  1: "0x7D51BABA56C2CA79e15eEc9ECc4E92d9c0a7dbeb",
};

async function simulateCall({
  account,
  args,
  functionName,
  publicClient,
  chainId,
}: VaultControllerSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account: account as Address,
      address: VAULT_CONTROLLER_ADDRESS[chainId],
      abi: VaultControllerAbi,
      // @ts-ignore
      functionName,
      // @ts-ignore
      args,
    });
    return { request: request, success: true, error: null };
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage };
  }
}

async function simulateVaultCall({
  address,
  account,
  functionName,
  publicClient,
}: VaultSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account: account as Address,
      address,
      abi: VaultAbi,
      // @ts-ignore
      functionName,
      // @ts-ignore
      args,
    });
    return { request: request, success: true, error: null };
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage };
  }
}

export async function proposeStrategy({
  strategy,
  vaultData,
  account,
  clients,
}: BaseWriteProps & { strategy: Address }): Promise<boolean> {
  showLoadingToast("Proposing new strategy...");

  const success = await handleCallResult({
    successMessage: "Proposed new strategy!",
    simulationResponse: await simulateCall({
      account: account as Address,
      functionName: "proposeVaultAdapters",
      args: [[vaultData.address], [strategy]],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId,
    }),
    clients,
  });

  return success;
}

export async function acceptStrategy({
  vaultData,
  account,
  clients,
}: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Accepting new strategy...");

  const success = await handleCallResult({
    successMessage: "Accepted new strategy!",
    simulationResponse: await simulateCall({
      account: account as Address,
      functionName: "changeVaultAdapters",
      args: [vaultData.address],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId,
    }),
    clients,
  });

  return success;
}

export async function proposeFees({
  fees,
  vaultData,
  account,
  clients,
}: BaseWriteProps & {
  fees: {
    deposit: bigint;
    withdrawal: bigint;
    management: bigint;
    performance: bigint;
  };
}): Promise<boolean> {
  showLoadingToast("Proposing new fees...");

  const success = await handleCallResult({
    successMessage: "Proposed new fees!",
    simulationResponse: await simulateCall({
      account: account as Address,
      functionName: "proposeVaultFees",
      args: [[vaultData.address], [fees]],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId,
    }),
    clients,
  });

  return success;
}

export async function acceptFees({
  vaultData,
  account,
  clients,
}: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Accepting new fees...");

  const success = await handleCallResult({
    successMessage: "Accepted new fees!",
    simulationResponse: await simulateCall({
      account: account as Address,
      functionName: "changeVaultFees",
      args: [vaultData.address],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId,
    }),
    clients,
  });

  return success;
}

export async function changeFeeRecipient({
  feeRecipient,
  vaultData,
  account,
  clients,
}: BaseWriteProps & { feeRecipient: Address }): Promise<boolean> {
  showLoadingToast("Changing fee recipient...");

  const success = await handleCallResult({
    successMessage: "Changed fee recipient!",
    simulationResponse: await simulateCall({
      account: account as Address,
      functionName: "setVaultFeeRecipients",
      args: [[vaultData.address], [feeRecipient]],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId,
    }),
    clients,
  });

  return success;
}

export async function changeDepositLimit({
  depositLimit,
  vaultData,
  account,
  clients,
}: BaseWriteProps & { depositLimit: number }): Promise<boolean> {
  showLoadingToast("Changing deposit limit...");

  const success = await handleCallResult({
    successMessage: "Changed deposit limit!",
    simulationResponse: await simulateCall({
      account: account as Address,
      functionName: "setVaultDepositLimits",
      args: [[vaultData.address], [depositLimit]],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId,
    }),
    clients,
  });

  return success;
}

export async function pauseVault({
  vaultData,
  account,
  clients,
}: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Pausing vault...");

  const success = await handleCallResult({
    successMessage: "Paused vault!",
    simulationResponse: await simulateCall({
      account: account as Address,
      functionName: "pauseVaults",
      args: [[vaultData.address]],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId,
    }),
    clients,
  });

  return success;
}

export async function unpauseVault({
  vaultData,
  account,
  clients,
}: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Unpausing vault...");

  const success = await handleCallResult({
    successMessage: "Unpaused vault!",
    simulationResponse: await simulateCall({
      account: account as Address,
      functionName: "unpauseVaults",
      args: [[vaultData.address]],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId,
    }),
    clients,
  });

  return success;
}

export async function takeFees({
  vaultData,
  account,
  clients,
}: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Taking fees...");

  return handleCallResult({
    successMessage: "Took fees!",
    simulationResponse: await simulateVaultCall({
      address: vaultData.address,
      account: account as Address,
      functionName: "takeManagementAndPerformanceFees",
      publicClient: clients.publicClient,
    }),
    clients,
  });
}
