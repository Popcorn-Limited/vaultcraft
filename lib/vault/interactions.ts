import { showLoadingToast } from "@/lib/toasts";
import { Clients, SimulationResponse } from "@/lib/types";
import { VaultAbi } from "@/lib/constants";
import { Address, PublicClient } from "viem";
import { VaultRouterAbi } from "@/lib/constants/abi/VaultRouter";
import { handleCallResult } from "../utils/helpers";

interface VaultWriteProps {
  chainId: number;
  vault: Address;
  account: Address;
  amount: number;
  clients: Clients;
}

interface VaultRouterWriteProps extends VaultWriteProps {
  router: Address;
  gauge: Address;
}

interface VaultSimulateProps {
  address: Address;
  account: Address;
  amount: number;
  functionName: string;
  publicClient: PublicClient;
}
interface VaultRouterSimulateProps extends VaultSimulateProps {
  vault: Address;
  gauge: Address;
}

async function simulateVaultCall({ address, account, amount, functionName, publicClient }: VaultSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: VaultAbi,
      // @ts-ignore
      functionName,
      // @dev Since numbers get converted to strings like 1e+21 or similar we need to convert it back to numbers like 10000000000000 and than cast them into BigInts
      args: [BigInt(Number(amount).toLocaleString("fullwide", { useGrouping: false }))]
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}

async function simulateVaultRouterCall({ address, account, amount, vault, gauge, functionName, publicClient }: VaultRouterSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: VaultRouterAbi,
      // @ts-ignore
      functionName,
      // @dev Since numbers get converted to strings like 1e+21 or similar we need to convert it back to numbers like 10000000000000 and than cast them into BigInts
      args: [vault, gauge, BigInt(Number(amount).toLocaleString("fullwide", { useGrouping: false })), account]
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}

export async function vaultDeposit({ chainId, vault, account, amount, clients }: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Depositing into the vault...")

  return handleCallResult({
    successMessage: "Deposited into the vault!",
    simulationResponse: await simulateVaultCall({ address: vault, account, amount, functionName: "deposit", publicClient: clients.publicClient }),
    clients
  })
}


export async function vaultRedeem({ chainId, vault, account, amount, clients }: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Withdrawing from the vault...")

  return handleCallResult({
    successMessage: "Withdrawn from the vault!",
    simulationResponse: await simulateVaultCall({ address: vault, account, amount, functionName: "redeem", publicClient: clients.publicClient }),
    clients
  })
}

export async function vaultDepositAndStake({ chainId, router, vault, gauge, account, amount, clients }: VaultRouterWriteProps): Promise<boolean> {
  showLoadingToast("Depositing into the vault...")

  return handleCallResult({
    successMessage: "Deposited into the vault and staked into Gauge!",
    simulationResponse: await simulateVaultRouterCall({ address: router, account, amount, vault, gauge, functionName: "depositAndStake", publicClient: clients.publicClient }),
    clients
  })
}

export async function vaultUnstakeAndWithdraw({ chainId, router, vault, gauge, account, amount, clients }: VaultRouterWriteProps): Promise<boolean> {
  showLoadingToast("Withdrawing from the vault...")

  return handleCallResult({
    successMessage: "Unstaked from Gauge and withdrawn from Vault!",
    simulationResponse: await simulateVaultRouterCall({ address: router, account, amount, vault, gauge, functionName: "unstakeAndWithdraw", publicClient: clients.publicClient }),
    clients
  })
}