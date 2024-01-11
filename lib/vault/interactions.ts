import { showLoadingToast } from "@/lib/toasts";
import { Clients, SimulationResponse, VaultData } from "@/lib/types";
import { VaultAbi } from "@/lib/constants";
import { Address, PublicClient } from "viem";
import { VaultRouterAbi } from "@/lib/constants/abi/VaultRouter";
import { handleCallResult } from "@/lib/utils/helpers";
import { FireEventArgs } from "@masa-finance/analytics-sdk";
import { networkMap } from "@/lib/utils/connectors";

interface VaultWriteProps {
  chainId: number;
  vaultData: VaultData;
  account: Address;
  amount: number;
  clients: Clients;
  fireEvent?: (type: string, { user_address, network, contract_address, asset_amount, asset_ticker, additionalEventData }: FireEventArgs) => Promise<void>;
  referral?: Address;
}

interface VaultRouterWriteProps extends VaultWriteProps {
  router: Address;
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

export async function vaultDeposit({ chainId, vaultData, account, amount, clients, fireEvent, referral }: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Depositing into the vault...")

  const success = await handleCallResult({
    successMessage: "Deposited into the vault!",
    simulationResponse: await simulateVaultCall({ address: vaultData.address, account, amount, functionName: "deposit", publicClient: clients.publicClient }),
    clients
  })

  if (success && fireEvent) {
    void fireEvent("addLiquidity", {
      user_address: account,
      network: networkMap[chainId].toLowerCase(),
      contract_address: vaultData.address,
      asset_amount: String(amount / (10 ** vaultData.asset.decimals)),
      asset_ticker: vaultData.asset.symbol,
      additionalEventData: {
        referral: referral,
        vault_name: vaultData.metadata.vaultName
      }
    });
  }
  return success
}


export async function vaultRedeem({ chainId, vaultData, account, amount, clients, fireEvent, referral }: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Withdrawing from the vault...")

  const maxRedeem = await clients.publicClient.readContract({
    address: vaultData.address,
    abi: VaultAbi,
    functionName: 'maxRedeem',
    args: [account]
  });

  if (maxRedeem < BigInt(Number(amount).toLocaleString("fullwide", { useGrouping: false }))) {
    amount = Number(maxRedeem)
  }

  const success = await handleCallResult({
    successMessage: "Withdrawn from the vault!",
    simulationResponse: await simulateVaultCall({ address: vaultData.address, account, amount, functionName: "redeem", publicClient: clients.publicClient }),
    clients
  })

  if (success && fireEvent) {
    void fireEvent("removeLiquidity", {
      user_address: account,
      network: networkMap[chainId].toLowerCase(),
      contract_address: vaultData.address,
      asset_amount: String(amount / (10 ** vaultData.vault.decimals)),
      asset_ticker: vaultData.asset.symbol,
      additionalEventData: {
        referral: referral,
        vault_name: vaultData.metadata.vaultName
      }
    });
  }
  return success
}

export async function vaultDepositAndStake({ chainId, router, vaultData, account, amount, clients, fireEvent, referral }: VaultRouterWriteProps): Promise<boolean> {
  showLoadingToast("Depositing into the vault...")

  const success = await handleCallResult({
    successMessage: "Deposited into the vault and staked into Gauge!",
    simulationResponse: await simulateVaultRouterCall({
      address: router,
      account,
      amount,
      vault: vaultData.address,
      gauge: vaultData.gauge?.address as Address,
      functionName: "depositAndStake",
      publicClient: clients.publicClient
    }),
    clients
  })
  if (success && fireEvent) {
    void fireEvent("addLiquidity", {
      user_address: account,
      network: networkMap[chainId].toLowerCase(),
      contract_address: vaultData.address,
      asset_amount: String(amount / (10 ** vaultData.asset.decimals)),
      asset_ticker: vaultData.asset.symbol,
      additionalEventData: {
        referral: referral,
        vault_name: vaultData.metadata.vaultName
      }
    });
  }
  return success
}

export async function vaultUnstakeAndWithdraw({ chainId, router, vaultData, account, amount, clients, fireEvent, referral }: VaultRouterWriteProps): Promise<boolean> {
  showLoadingToast("Withdrawing from the vault...")

  const success = await handleCallResult({
    successMessage: "Unstaked from Gauge and withdrawn from Vault!",
    simulationResponse: await simulateVaultRouterCall({
      address: router,
      account,
      amount,
      vault: vaultData.address,
      gauge: vaultData.gauge?.address as Address,
      functionName: "unstakeAndWithdraw",
      publicClient: clients.publicClient
    }),
    clients
  })
  if (success && fireEvent) {
    void fireEvent("removeLiquidity", {
      user_address: account,
      network: networkMap[chainId].toLowerCase(),
      contract_address: vaultData.address,
      asset_amount: String(amount / (10 ** vaultData.vault.decimals)),
      asset_ticker: vaultData.asset.symbol,
      additionalEventData: {
        referral: referral,
        vault_name: vaultData.metadata.vaultName
      }
    });
  }
  return success
}
