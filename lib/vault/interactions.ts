import { showSuccessToast, showErrorToast, showLoadingToast } from "@/lib/toasts";
import { SimulationResponse } from "@/lib/types";
import { ERC20Abi, VaultAbi } from "@/lib/constants";
import { Address, PublicClient, WalletClient } from "viem";
import { VaultRouterAbi } from "@/lib/constants/abi/VaultRouter";
import zap from "./zap";
import { handleAllowance } from "../approve";
import axios from "axios";

interface VaultWriteProps {
  address: Address;
  account: Address;
  amount: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

interface VaultSimulateProps {
  address: Address;
  account: Address;
  amount: number;
  functionName: string;
  publicClient: PublicClient;
}

interface VaultRouterWriteProps {
  address: Address;
  account: Address;
  amount: number;
  vault: Address;
  gauge: Address;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

interface VaultRouterSimulateProps {
  address: Address;
  account: Address;
  amount: number;
  vault: Address;
  gauge: Address;
  functionName: string;
  publicClient: PublicClient;
}

interface ZapIntoVaultProps {
  sellToken: Address;
  asset: Address;
  vault: Address;
  account: Address;
  amount: number;
  assetBal: number;
  slippage?: number;
  tradeTimeout?: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

interface ZapIntoGaugeProps extends ZapIntoVaultProps {
  router: Address;
  gauge: Address;
}

interface ZapOutOfVaultProps {
  buyToken: Address;
  asset: Address;
  vault: Address;
  account: Address;
  amount: number;
  assetBal: number;
  slippage?: number;
  tradeTimeout?: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

interface ZapOutOfGaugeProps extends ZapOutOfVaultProps {
  router: Address;
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

export async function vaultDeposit({ address, account, amount, publicClient, walletClient }: VaultWriteProps): Promise<boolean> {
  console.log({ address, account, amount, publicClient, walletClient })
  showLoadingToast("Depositing into the vault...")

  const { request, success, error: simulationError } = await simulateVaultCall({ address, account, amount, functionName: "deposit", publicClient })

  if (success) {
    try {
      const hash = await walletClient.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Deposited into the vault!")
      return true;
    } catch (error: any) {
      showErrorToast(error.shortMessage)
      return false;
    }
  } else {
    showErrorToast(simulationError)
    return false;
  }
}


export async function vaultRedeem({ address, account, amount, publicClient, walletClient }: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Withdrawing from the vault...")

  const { request, success, error: simulationError } = await simulateVaultCall({ address, account, amount, functionName: "redeem", publicClient })

  if (success) {
    try {
      const hash = await walletClient.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Withdrawn from the vault!")
      return true;
    } catch (error: any) {
      showErrorToast(error.shortMessage)
      return false;
    }
  } else {
    showErrorToast(simulationError)
    return false;
  }
}

export async function vaultDepositAndStake({ address, account, amount, vault, gauge, publicClient, walletClient }: VaultRouterWriteProps): Promise<boolean> {
  showLoadingToast("Depositing into the vault...")

  const { request, success, error: simulationError } = await simulateVaultRouterCall({
    address, account, amount, vault, gauge, functionName: "depositAndStake", publicClient
  })

  if (success) {
    try {
      const hash = await walletClient.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Deposited into the vault!")
      return true;
    } catch (error: any) {
      showErrorToast(error.shortMessage)
      return false;
    }
  } else {
    showErrorToast(simulationError)
    return false;
  }
}

export async function vaultUnstakeAndWithdraw({ address, account, amount, vault, gauge, publicClient, walletClient }: VaultRouterWriteProps): Promise<boolean> {
  showLoadingToast("Withdrawing from the vault...")

  const { request, success, error: simulationError } = await simulateVaultRouterCall({
    address, account, amount, vault, gauge, functionName: "unstakeAndWithdraw", publicClient
  })

  if (success) {
    try {
      const hash = await walletClient.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Withdrawn from the vault!")
      return true;
    } catch (error: any) {
      showErrorToast(error.shortMessage)
      return false;
    }
  } else {
    showErrorToast(simulationError)
    return false;
  }
}

export async function zapIntoVault({ sellToken, asset, vault, account, amount, assetBal, slippage = 100, tradeTimeout = 60, publicClient, walletClient }: ZapIntoVaultProps): Promise<boolean> {
  showLoadingToast("Zapping into asset...")
  const successZap = await zap({ sellToken, buyToken: asset, amount, account, publicClient, walletClient, slippage, tradeTimeout })
  const postBal = Number(await publicClient.readContract({ address: asset, abi: ERC20Abi, functionName: "balanceOf", args: [account] }))

  if (successZap) {
    console.log({ postBal, assetBal })

    const depositAmount = postBal - assetBal
    console.log({ depositAmount })

    await handleAllowance({
      token: asset,
      inputAmount: depositAmount,
      account,
      spender: vault,
      publicClient,
      walletClient
    })
    return await vaultDeposit({ address: vault, account, amount: depositAmount, publicClient, walletClient })
  } else {
    return false
  }
}

export async function zapIntoGauge({ sellToken, asset, router, vault, gauge, account, amount, assetBal, slippage = 100, tradeTimeout = 60, publicClient, walletClient }: ZapIntoGaugeProps): Promise<boolean> {
  showLoadingToast("Zapping into asset...")
  const successZap = await zap({ sellToken, buyToken: asset, amount, account, publicClient, walletClient, slippage, tradeTimeout })
  const postBal = Number(await publicClient.readContract({ address: asset, abi: ERC20Abi, functionName: "balanceOf", args: [account] }))
  console.log({ postBal, assetBal })
  if (successZap) {
    const depositAmount = postBal - assetBal
    console.log({ depositAmount })
    await handleAllowance({
      token: asset,
      inputAmount: depositAmount,
      account,
      spender: router,
      publicClient,
      walletClient
    })
    return await vaultDepositAndStake({ address: router, account, vault, gauge, amount: depositAmount, publicClient, walletClient })
  } else {
    return false
  }
}

export async function zapOutOfVault({ buyToken, asset, vault, account, amount, assetBal, slippage = 100, tradeTimeout = 60, publicClient, walletClient }: ZapOutOfVaultProps): Promise<boolean> {
  const success = await vaultRedeem({
    address: vault,
    account,
    amount,
    publicClient,
    walletClient
  })
  const postBal = Number(await publicClient.readContract({ address: asset, abi: ERC20Abi, functionName: "balanceOf", args: [account] }))
  console.log({ postBal, assetBal, amount: postBal - assetBal })

  if (success) {
    showLoadingToast("Zapping into asset...")
    return await zap({
      account,
      walletClient,
      publicClient,
      sellToken: asset,
      buyToken,
      amount: postBal - assetBal,
      slippage,
      tradeTimeout
    })
  } else {
    return false
  }
}

export async function zapOutOfGauge({ buyToken, asset, router, vault, gauge, account, amount, assetBal, slippage = 100, tradeTimeout = 60, publicClient, walletClient }: ZapOutOfGaugeProps): Promise<boolean> {
  const success = await vaultUnstakeAndWithdraw({
    address: router,
    account,
    amount,
    vault,
    gauge,
    publicClient,
    walletClient
  })
  const postBal = Number(await publicClient.readContract({ address: asset, abi: ERC20Abi, functionName: "balanceOf", args: [account] }))
  console.log({ postBal, assetBal, amount: postBal - assetBal })

  if (success) {
    showLoadingToast("Zapping into asset...")
    return await zap({
      account,
      walletClient,
      publicClient,
      sellToken: asset,
      buyToken,
      amount: postBal - assetBal,
      slippage,
      tradeTimeout
    })
  } else {
    return false
  }
}