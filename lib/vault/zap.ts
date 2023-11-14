import axios from "axios"
import { Address, PublicClient, WalletClient, getAddress } from "viem";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { handleAllowance } from "@/lib/approve";

interface ZapProps {
  sellToken: Address;
  buyToken: Address;
  amount: number;
  account: Address;
  publicClient: PublicClient;
  walletClient: WalletClient;
  slippage?: number; // slippage allowance in BPS 
  tradeTimeout?: number; // in s
}

export default async function zap({ sellToken, buyToken, amount, account, publicClient, walletClient, slippage = 100, tradeTimeout = 60 }: ZapProps): Promise<boolean> {
  const ensoWallet = (await axios.get(
    `https://api.enso.finance/api/v1/wallet?chainId=1&fromAddress=${account}`,
    { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } })
  ).data
  console.log({ ensoWallet: ensoWallet })
  const success = await handleAllowance({
    token: sellToken,
    inputAmount: amount,
    account,
    spender: getAddress(ensoWallet.address),
    publicClient,
    walletClient
  })
  if (!success) return false

  console.log({ qouteUrl: `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=${account}&spender=${account}&receiver=${account}&amountIn=${amount.toLocaleString("fullwide", { useGrouping: false })}&slippage=${slippage}&tokenIn=${sellToken}&tokenOut=${buyToken}` })
  const quote = (await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=${account}&spender=${account}&receiver=${account}&amountIn=${amount.toLocaleString("fullwide", { useGrouping: false })}&slippage=${slippage}&tokenIn=${sellToken}&tokenOut=${buyToken}`,
    { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } }
  )).data
  console.log({ quote })

  try {
    const hash = await walletClient.sendTransaction(quote.tx)
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    showSuccessToast("Zapped successfully")
    return true;
  } catch (error: any) {
    console.log(error)
    showErrorToast(error.shortMessage)
    return false;
  }
}