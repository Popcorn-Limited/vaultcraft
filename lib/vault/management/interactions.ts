import { MultiStrategyVaultAbi, MultiStrategyVaultV2_1Abi, MultiStrategyVaultV2Abi, VaultAbi, VaultControllerAbi, VaultControllerByChain } from "@/lib/constants";
import { showLoadingToast } from "@/lib/toasts"
import { Clients, VaultAllocation, VaultData, VaultsV2FeeConfig } from "@/lib/types"
import { SimulationContract, handleCallResult, simulateCall } from "@/lib/utils/helpers"
import { Address, maxUint256 } from "viem"

export interface BaseWriteProps {
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
      args: [allocations],
      publicClient: clients.publicClient
    }),
    clients
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
      args: [allocations],
      publicClient: clients.publicClient
    }),
    clients
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
    clients
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
    clients
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
    clients
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
    clients
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
    clients
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
    clients
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
    clients
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
    clients
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
    clients
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
      functionName,
      args,
      publicClient: clients.publicClient
    }),
    clients
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
    clients
  });
}


export async function setDepositIndex({
  depositIndex,
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps & { depositIndex: number }): Promise<boolean> {
  showLoadingToast("Setting new deposit index...");

  return handleCallResult({
    successMessage: "New deposit index set!",
    simulationResponse: await simulateCall({
      contract: {
        address,
        abi: MultiStrategyVaultV2Abi
      },
      account: account as Address,
      functionName: "setDepositIndex",
      args: [depositIndex === Number(maxUint256) ? maxUint256 : BigInt(depositIndex)],
      publicClient: clients.publicClient
    }),
    clients
  });
}

export async function setWithdrawalQueue({
  withdrawalQueue,
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps & { withdrawalQueue: number[] }): Promise<boolean> {
  showLoadingToast("Setting new withdrawal queue...");

  return handleCallResult({
    successMessage: "New withdrawal queue set!",
    simulationResponse: await simulateCall({
      contract: {
        address,
        abi: MultiStrategyVaultV2Abi
      },
      account: account as Address,
      functionName: "setWithdrawalQueue",
      args: [withdrawalQueue.map(e => BigInt(e))],
      publicClient: clients.publicClient
    }),
    clients
  });
}

export async function setV2Fees({
  fees,
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps & { fees: VaultsV2FeeConfig }): Promise<boolean> {
  showLoadingToast("Setting new fees...");

  let params: any = {}
  if (fees.management.exists) {
    params = {
      abi: MultiStrategyVaultV2_1Abi,
      functionName: "setFees",
      args: [BigInt(fees.performance.value), BigInt(fees.management.value)]
    }
  } else {
    params = {
      abi: MultiStrategyVaultV2Abi,
      functionName: "setPerformanceFee",
      args: [BigInt(fees.performance.value)]
    }
  }

  return handleCallResult({
    successMessage: "New fees set!",
    simulationResponse: await simulateCall({
      contract: {
        address,
        abi: params.abi
      },
      account: account as Address,
      functionName: params.functionName,
      args: params.args,
      publicClient: clients.publicClient
    }),
    clients
  });
}

export async function proposeVaultV2NewStrategies({
  strategies,
  withdrawalQueue,
  depositIndex,
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps & { strategies: Address[], withdrawalQueue: number[], depositIndex: number }): Promise<boolean> {
  showLoadingToast("Proposing new strategies...");

  return handleCallResult({
    successMessage: "New strategies proposed!",
    simulationResponse: await simulateCall({
      contract: {
        address,
        abi: MultiStrategyVaultV2Abi
      },
      account: account as Address,
      functionName: "proposeStrategies",
      args: [strategies, withdrawalQueue.map(e => BigInt(e)), depositIndex === Number(maxUint256) ? maxUint256 : BigInt(depositIndex)],
      publicClient: clients.publicClient
    }),
    clients
  });
}

export async function changeVaultV2NewStrategies({
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Accepting new strategies...");

  return handleCallResult({
    successMessage: "Accepted new strategies!",
    simulationResponse: await simulateCall({
      contract: {
        address,
        abi: MultiStrategyVaultV2_1Abi
      },
      account: account as Address,
      functionName: "changeStrategies",
      publicClient: clients.publicClient
    }),
    clients
  });
}