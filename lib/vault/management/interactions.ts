import { StakingVaultAbi, VaultAbi, VaultControllerAbi, ZERO } from "@/lib/constants"
import { showLoadingToast } from "@/lib/toasts"
import { Clients, SimulationResponse, LockVaultData } from "@/lib/types"
import { networkMap } from "@/lib/utils/connectors"
import { handleCallResult } from "@/lib/utils/helpers"
import { FireEventArgs } from "@masa-finance/analytics-sdk";
import { Address, PublicClient } from "viem"

interface BaseWriteProps {
  vaultData: LockVaultData;
  account: Address;
  clients: Clients;
}

interface IncreaseAmountWrite extends BaseWriteProps {
  amount: number;
}

interface DistributeRewardsWrite extends BaseWriteProps {
  token: Address;
  amount: number;
}

interface WritePropsWithRef extends BaseWriteProps {
  fireEvent?: (type: string, { user_address, network, contract_address, asset_amount, asset_ticker, additionalEventData }: FireEventArgs) => Promise<void>;
  referral?: Address;
}

interface WithdrawWrite extends WritePropsWithRef {
  amount: number;
}

interface DepositWrite extends WritePropsWithRef {
  amount: number;
  days: number;
}

interface VaultControllerSimulateProps {
  account: Address;
  args: any[];
  functionName: string;
  publicClient: PublicClient;
  chainId: number
}

interface VaultSimulateProps {
  address: Address;
  account: Address;
  functionName: string;
  publicClient: PublicClient;
}

const VAULT_CONTROLLER_ADDRESS: { [key: number]: Address } = {
  1: "0x7D51BABA56C2CA79e15eEc9ECc4E92d9c0a7dbeb"
}

async function simulateCall({ account, args, functionName, publicClient, chainId }: VaultControllerSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address: VAULT_CONTROLLER_ADDRESS[chainId],
      abi: VaultControllerAbi,
      // @ts-ignore
      functionName,
      // @ts-ignore
      args
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}

async function simulateVaultCall({ address, account, functionName, publicClient }: VaultSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: VaultAbi,
      // @ts-ignore
      functionName,
      // @ts-ignore
      args
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}

export async function proposeStrategy({ strategy, vaultData, account, clients }: any): Promise<boolean> {
  showLoadingToast("Proposing new strategy...")

  const success = await handleCallResult({
    successMessage: "Proposed new strategy!",
    simulationResponse: await simulateCall({
      account,
      functionName: "proposeVaultAdapters",
      args: [[vaultData.address], [strategy]],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId
    }),
    clients
  })

  return success
}

export async function acceptStrategy({ vaultData, account, clients }: any): Promise<boolean> {
  showLoadingToast("Accepting new strategy...")

  const success = await handleCallResult({
    successMessage: "Accepted new strategy!",
    simulationResponse: await simulateCall({
      account,
      functionName: "changeVaultAdapters",
      args: [vaultData.address],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId
    }),
    clients
  })

  return success
}

export async function proposeFees({ fees, vaultData, account, clients }: any): Promise<boolean> {
  showLoadingToast("Proposing new fees...")

  const success = await handleCallResult({
    successMessage: "Proposed new fees!",
    simulationResponse: await simulateCall({
      account,
      functionName: "proposeVaultFees",
      args: [[vaultData.address], [fees]],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId
    }),
    clients
  })

  return success
}

export async function acceptFees({ vaultData, account, clients }: any): Promise<boolean> {
  showLoadingToast("Accepting new fees...")

  const success = await handleCallResult({
    successMessage: "Accepted new fees!",
    simulationResponse: await simulateCall({
      account,
      functionName: "changeVaultFees",
      args: [vaultData.address],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId
    }),
    clients
  })

  return success
}

export async function changeFeeRecipient({ feeRecipient, vaultData, account, clients }: any): Promise<boolean> {
  showLoadingToast("Changing fee recipient...")

  const success = await handleCallResult({
    successMessage: "Changed fee recipient!",
    simulationResponse: await simulateCall({
      account,
      functionName: "setVaultFeeRecipients",
      args: [[vaultData.address], [feeRecipient]],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId
    }),
    clients
  })

  return success
}

export async function changeDepositLimit({ depositLimit, vaultData, account, clients }: any): Promise<boolean> {
  showLoadingToast("Changing deposit limit...")

  const success = await handleCallResult({
    successMessage: "Changed deposit limit!",
    simulationResponse: await simulateCall({
      account,
      functionName: "setVaultDepositLimits",
      args: [[vaultData.address], [depositLimit]],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId
    }),
    clients
  })

  return success
}

export async function pauseVault({ vaultData, account, clients }: any): Promise<boolean> {
  showLoadingToast("Pausing vault...")

  const success = await handleCallResult({
    successMessage: "Paused vault!",
    simulationResponse: await simulateCall({
      account,
      functionName: "pauseVaults",
      args: [[vaultData.address]],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId
    }),
    clients
  })

  return success
}

export async function unpauseVault({ vaultData, account, clients }: any): Promise<boolean> {
  showLoadingToast("Unpausing vault...")

  const success = await handleCallResult({
    successMessage: "Unpaused vault!",
    simulationResponse: await simulateCall({
      account,
      functionName: "unpauseVaults",
      args: [[vaultData.address]],
      publicClient: clients.publicClient,
      chainId: vaultData.chainId
    }),
    clients
  })

  return success
}


export async function takeFees({ vaultData, account, clients }: any): Promise<boolean> {
  showLoadingToast("Taking fees...")

  return handleCallResult({
    successMessage: "Took fees!",
    simulationResponse: await simulateVaultCall(
      {
        address: vaultData.address,
        account,
        functionName: "takeManagementAndPerformanceFees",
        publicClient: clients.publicClient
      }),
    clients
  })
}