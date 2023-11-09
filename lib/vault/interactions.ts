import { showSuccessToast, showErrorToast, showLoadingToast } from "@/lib/toasts";
import { SimulationResponse } from "@/lib/types";
import { VaultAbi } from "@/lib/constants";
import { Address, PublicClient, WalletClient } from "viem";
import { VaultRouterAbi } from "@/lib/constants/abi/VaultRouter";
import { handleAllowance } from "../approve";
import axios from "axios";
import zap from "./zap";

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
  slippage?: number;
  tradeTimeout?: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

interface ZapIntoGaugeProps extends ZapIntoVaultProps {
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

// TODO -- error handling
export async function zapIntoVault({ sellToken, asset, vault, account, amount, slippage = 100, tradeTimeout = 60, publicClient, walletClient }: ZapIntoVaultProps): Promise<boolean> {
  showLoadingToast("Zapping into asset...")
  console.log("zap")
  const orderId = await zap({ sellToken, buyToken: asset, amount, account, signer: walletClient, slippage, tradeTimeout })
  // console.log({ orderId })
  // // await fullfillment
  // console.log("waiting for order fulfillment")

  // let traded = false;

  // let secondsPassed = 0;
  // setInterval(() => { console.log(secondsPassed); secondsPassed += 1 }, 1000)

  // let success = false;

  // publicClient.watchEvent({
  //   address: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
  //   event: { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "contract IERC20", "name": "sellToken", "type": "address" }, { "indexed": false, "internalType": "contract IERC20", "name": "buyToken", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "sellAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "buyAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feeAmount", "type": "uint256" }, { "indexed": false, "internalType": "bytes", "name": "orderUid", "type": "bytes" }], "name": "Trade", "type": "event" },
  //   onLogs: async (logs) => {
  //     console.log(logs)
  //     traded = true;
  //     console.log("do stuff")
  //     const found = logs.find(log => log.args.orderUid?.toLowerCase() === orderId.toLowerCase())
  //     if (found) {
  //       console.log("MATCHED ORDER")

  //       let depositAmount = Number(found.args.buyAmount);

  //       console.log({ depositAmount })
  //       console.log("approving vault")
  //       // approve vault
  //       await handleAllowance({
  //         token: asset,
  //         inputAmount: depositAmount,
  //         account,
  //         spender: vault,
  //         publicClient,
  //         walletClient
  //       })
  //       console.log("vault deposit")
  //       success = await vaultDeposit({ address: vault, account, amount: depositAmount, publicClient, walletClient })
  //     }
  //   }
  // })

  // setTimeout(() => {
  //   if (!traded) {
  //     console.log("ERROR")
  //     showErrorToast("Zap Order failed")
  //   }
  // }, tradeTimeout * 1000)

  return false
}

// TODO -- error handling
export async function zapIntoGauge({ sellToken, asset, router, vault, gauge, account, amount, slippage = 100, tradeTimeout = 60, publicClient, walletClient }: ZapIntoGaugeProps): Promise<boolean> {
  showLoadingToast("Zapping into asset...")

  console.log("zap")
  const orderId = await zap({ sellToken, buyToken: asset, amount, account, signer: walletClient, slippage, tradeTimeout })
  console.log({ orderId })
  // await fullfillment
  console.log("waiting for order fulfillment")

  let traded = false;

  let secondsPassed = 0;
  setInterval(() => { console.log(secondsPassed); secondsPassed += 1 }, 1000)

  let success = false;

  publicClient.watchEvent({
    address: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
    event: { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "contract IERC20", "name": "sellToken", "type": "address" }, { "indexed": false, "internalType": "contract IERC20", "name": "buyToken", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "sellAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "buyAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feeAmount", "type": "uint256" }, { "indexed": false, "internalType": "bytes", "name": "orderUid", "type": "bytes" }], "name": "Trade", "type": "event" },
    onLogs: async (logs) => {
      console.log(logs)
      traded = true;
      console.log("do stuff")
      const found = logs.find(log => log.args.orderUid?.toLowerCase() === orderId.toLowerCase())
      if (found) {
        console.log("MATCHED ORDER")

        let depositAmount = Number(found.args.buyAmount);

        console.log({ depositAmount })
        console.log("approving vault")
        // approve router
        await handleAllowance({
          token: asset,
          inputAmount: depositAmount,
          account,
          spender: router,
          publicClient,
          walletClient
        })
        console.log("vault deposit and stake")
        success = await vaultDepositAndStake({ address: router, account, vault, gauge, amount: depositAmount, publicClient, walletClient })
      }
    }
  })

  setTimeout(() => {
    if (!traded) {
      console.log("ERROR")
      showErrorToast("Zap Order failed")
    }
  }, tradeTimeout * 1000)

  return success
}