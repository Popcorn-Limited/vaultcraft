import axios from "axios"
import { Address, PublicClient, WalletClient, getAddress } from "viem";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { handleAllowance } from "@/lib/approve";
import { Clients } from "../types";

interface ZapProps {
  chainId: number;
  sellToken: Address;
  buyToken: Address;
  amount: number;
  account: Address;
  slippage?: number; // slippage allowance in BPS 
  tradeTimeout?: number; // in s
  clients: Clients;
}

export default async function zap({ chainId, sellToken, buyToken, amount, account, slippage = 100, tradeTimeout = 60, clients }: ZapProps): Promise<boolean> {
  const quote = (await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${account}&spender=${account}&receiver=${account}&amountIn=${amount.toLocaleString("fullwide", { useGrouping: false })}&slippage=${slippage}&tokenIn=${sellToken}&tokenOut=${buyToken}`,
    { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } }
  )).data
  try {
    const hash = await clients.walletClient.sendTransaction(quote.tx)
    const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
    showSuccessToast("Zapped successfully")
    return true;
  } catch (error: any) {
    console.log(error)
    showErrorToast(error.shortMessage)
    return false;
  }
}