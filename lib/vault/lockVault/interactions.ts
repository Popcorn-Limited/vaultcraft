import { StakingVaultAbi } from "@/lib/constants"
import { showLoadingToast } from "@/lib/toasts"
import { Clients, SimulationResponse, VaultData } from "@/lib/types"
import { networkMap } from "@/lib/utils/connectors"
import { handleCallResult } from "@/lib/utils/helpers"
import { FireEventArgs } from "@masa-finance/analytics-sdk";
import { Address, PublicClient } from "viem"

interface BaseWriteProps {
  vaultData: VaultData;
  account: Address;
  clients: Clients;
}

interface IncreaseAmountWrite extends BaseWriteProps {
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
  days:number;
}

interface VaultSimulateProps {
  address: Address;
  account: Address;
  args: any[];
  functionName: string;
  publicClient: PublicClient;
}

async function simulateCall({ address, account, args, functionName, publicClient }: VaultSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: StakingVaultAbi,
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

export async function handleDeposit({ vaultData, account, amount, days, clients, fireEvent, referral }: DepositWrite): Promise<boolean> {
  showLoadingToast("Depositing into the vault...")

  const success = await handleCallResult({
    successMessage: "Deposited into the vault!",
    simulationResponse: await simulateCall({
      address: vaultData.address,
      account,
      args: [account, BigInt(Number(amount).toLocaleString("fullwide", { useGrouping: false })), days * 86400],
      functionName: "deposit",
      publicClient: clients.publicClient
    }),
    clients
  })

  if (success && fireEvent) {
    void fireEvent("addLiquidity", {
      user_address: account,
      network: networkMap[vaultData.chainId].toLowerCase(),
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

export async function handleIncreaseAmount({ vaultData, account, amount, clients }: IncreaseAmountWrite): Promise<boolean> {
  showLoadingToast("Depositing into the vault...")

  const success = await handleCallResult({
    successMessage: "Deposited into the vault!",
    simulationResponse: await simulateCall({
      address: vaultData.address,
      account,
      args: [account, BigInt(Number(amount).toLocaleString("fullwide", { useGrouping: false }))],
      functionName: "increaseAmount",
      publicClient: clients.publicClient
    }),
    clients
  })
  return success
}

export async function handleClaim({ vaultData, account, clients }: BaseWriteProps): Promise<boolean> {
  showLoadingToast("Claiming rewards...")

  const success = await handleCallResult({
    successMessage: "Claimed rewards!",
    simulationResponse: await simulateCall({
      address: vaultData.address,
      account,
      args: [account],
      functionName: "claim",
      publicClient: clients.publicClient
    }),
    clients
  })
  return success
}

export async function handleWithdraw({ vaultData, account, amount, clients, fireEvent, referral }: WithdrawWrite): Promise<boolean> {
  showLoadingToast("Withdrawing from the vault...")

  const success = await handleCallResult({
    successMessage: "Withdrawn from the vault!",
    simulationResponse: await simulateCall({
      address: vaultData.address,
      account,
      args: [account, account],
      functionName: "withdraw",
      publicClient: clients.publicClient
    }),
    clients
  })

  if (success && fireEvent) {
    void fireEvent("removeLiquidity", {
      user_address: account,
      network: networkMap[vaultData.chainId].toLowerCase(),
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

export async function handleDistributeRewards({ vaultData, account, amount, clients }: IncreaseAmountWrite): Promise<boolean> {
  showLoadingToast("Distributing rewards...")

  const success = await handleCallResult({
    successMessage: "Distributed rewards!",
    simulationResponse: await simulateCall({
      address: vaultData.address,
      account,
      args: [BigInt(Number(amount).toLocaleString("fullwide", { useGrouping: false }))],
      functionName: "distributeRewards",
      publicClient: clients.publicClient
    }),
    clients
  })
  return success
}