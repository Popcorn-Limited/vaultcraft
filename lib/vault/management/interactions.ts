import { MultiStrategyVaultAbi, VaultAbi, VaultControllerAbi, VaultControllerByChain } from "@/lib/constants";
import { showLoadingToast } from "@/lib/toasts"
import { AddressByChain, Clients, SimulationResponse, VaultAllocation, VaultData } from "@/lib/types"
import { SimulationContract, handleCallResult, simulateCall } from "@/lib/utils/helpers"
import { VaultController } from "vaultcraft-sdk";
import { Address } from "viem"

interface BaseWriteProps {
  vaultData: VaultData;
  address: Address;
  account?: Address;
  clients: Clients;
}

function getSimulationContract(address: Address, chainId: number): SimulationContract {
  if (address === VaultControllerByChain[chainId]) {
    return {
      address,
      abi: VaultControllerAbi
    }
  } else {
    return {
      address,
      abi: VaultAbi
    }
  }
}

export async function allocateToStrategies({
  allocations,
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps & { allocations: VaultAllocation[] }): Promise<boolean> {
  showLoadingToast("Allocating into strategies...");

  const success = await handleCallResult({
    successMessage: "Allocated into strategies!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: vaultData.address, abi: MultiStrategyVaultAbi },
      functionName: "pushFunds",
      args: allocations,
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: vaultData.address, 
    functionName: "pushFunds"
  });

  return success;
}

export async function deallocateFromStrategies({
  allocations,
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps & { allocations: VaultAllocation[] }): Promise<boolean> {
  showLoadingToast("Deallocating from strategies...");

  const success = await handleCallResult({
    successMessage: "Deallocated from strategies!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: vaultData.address, abi: MultiStrategyVaultAbi },
      functionName: "pullFunds",
      args: allocations,
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: vaultData.address, 
    functionName: "pullFunds"
  });

  return success;
}

export async function proposeStrategies({
  strategies,
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps & { strategies: Address[] }): Promise<boolean> {
  showLoadingToast("Proposing new strategies...");

  const success = await handleCallResult({
    successMessage: "Proposed new strategies!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: vaultData.address, abi: MultiStrategyVaultAbi },
      functionName: "proposeStrategies",
      args: strategies,
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: vaultData.address, 
    functionName: "proposeStrategies"
  });

  return success;
}

export async function acceptStrategies({
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Accepting new strategies...");

  const success = await handleCallResult({
    successMessage: "Accepted new strategies!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: vaultData.address, abi: MultiStrategyVaultAbi },
      functionName: "changeStrategies",
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: vaultData.address, 
    functionName: "changeStrategies"
  });

  return success;
}

export async function proposeStrategy({
  strategy,
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps & { strategy: Address }): Promise<boolean> {
  showLoadingToast("Proposing new strategy...");

  let functionName = "proposeAdapter"
  let args: any[] = [strategy]
  if (address === VaultControllerByChain[vaultData.chainId]) {
    functionName = "proposeVaultAdapters";
    args = [[vaultData.address], [strategy]]
  }

  const success = await handleCallResult({
    successMessage: "Proposed new strategy!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: getSimulationContract(address, vaultData.chainId),
      functionName,
      args,
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: address, 
    functionName: "proposeAdapter"
  });

  return success;
}

export async function acceptStrategy({
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Accepting new strategy...");

  let functionName = "changeAdapter"
  let args: any = undefined
  if (address === VaultControllerByChain[vaultData.chainId]) {
    functionName = "changeVaultAdapters";
    args = [vaultData.address]
  }

  const success = await handleCallResult({
    successMessage: "Accepted new strategy!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: getSimulationContract(address, vaultData.chainId),
      functionName,
      args,
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: address, 
    functionName: "changeAdapter"
  });

  return success;
}

export async function proposeFees({
  fees,
  vaultData,
  address,
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

  let functionName = "proposeFees"
  let args: any = [fees]
  if (address === VaultControllerByChain[vaultData.chainId]) {
    functionName = "proposeVaultFees";
    args = [[vaultData.address], [fees]]
  }

  const success = await handleCallResult({
    successMessage: "Proposed new fees!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: getSimulationContract(address, vaultData.chainId),
      functionName,
      args,
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: address, 
    functionName: "proposeFees"
  });

  return success;
}

export async function acceptFees({
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Accepting new fees...");

  let functionName = "changeFees"
  let args: any = undefined
  if (address === VaultControllerByChain[vaultData.chainId]) {
    functionName = "changeVaultFees";
    args = [vaultData.address]
  }

  const success = await handleCallResult({
    successMessage: "Accepted new fees!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: getSimulationContract(address, vaultData.chainId),
      functionName,
      args,
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: address, 
    functionName: "changeFees"
  });

  return success;
}

export async function changeFeeRecipient({
  feeRecipient,
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps & { feeRecipient: Address }): Promise<boolean> {
  showLoadingToast("Changing fee recipient...");

  let functionName = "setFeeRecipient"
  let args: any = [feeRecipient]
  if (address === VaultControllerByChain[vaultData.chainId]) {
    functionName = "setVaultFeeRecipients";
    args = [[vaultData.address], [feeRecipient]]
  }

  const success = await handleCallResult({
    successMessage: "Changed fee recipient!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: getSimulationContract(address, vaultData.chainId),
      functionName,
      args,
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: address, 
    functionName: "setFeeRecipient"
  });

  return success;
}

export async function changeDepositLimit({
  depositLimit,
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps & { depositLimit: number }): Promise<boolean> {
  showLoadingToast("Changing deposit limit...");

  let functionName = "setDepositLimit"
  let args: any = [depositLimit]
  if (address === VaultControllerByChain[vaultData.chainId]) {
    functionName = "setVaultDepositLimits";
    args = [[vaultData.address], [depositLimit]]
  }

  const success = await handleCallResult({
    successMessage: "Changed deposit limit!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: getSimulationContract(address, vaultData.chainId),
      functionName,
      args,
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: address, 
    functionName: "setDepositLimit"
  });

  return success;
}

export async function pauseVault({
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Pausing vault...");

  let functionName = "pause"
  let args: any = undefined
  if (address === VaultControllerByChain[vaultData.chainId]) {
    functionName = "pauseVaults";
    args = [[vaultData.address]]
  }

  const success = await handleCallResult({
    successMessage: "Paused vault!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: getSimulationContract(address, vaultData.chainId),
      functionName,
      args,
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: address, 
    functionName: "pause"
  });

  return success;
}

export async function unpauseVault({
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Unpausing vault...");

  let functionName = "unpause"
  let args: any = undefined
  if (address === VaultControllerByChain[vaultData.chainId]) {
    functionName = "unpauseVaults";
    args = [[vaultData.address]]
  }

  const success = await handleCallResult({
    successMessage: "Unpaused vault!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: getSimulationContract(address, vaultData.chainId),
      functionName: "unpauseVaults",
      args: [[vaultData.address]],
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: address, 
    functionName: "unpause"
  });

  return success;
}

export async function takeFees({
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Taking fees...");

  return handleCallResult({
    successMessage: "Took fees!",
    simulationResponse: await simulateCall({
      contract: {
        address,
        abi: VaultAbi
      },
      account: account as Address,
      functionName: "takeManagementAndPerformanceFees",
      publicClient: clients.publicClient
    }),
    clients,
    user: account,
    target: address, 
    functionName: "takeManagementAndPerformanceFees"
  });
}
