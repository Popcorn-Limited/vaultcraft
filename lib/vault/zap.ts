import axios from "axios"
import { Address, getAddress, zeroAddress } from "viem";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { AddressByChain, Clients, ZapProvider } from "@/lib/types";
import { handleAllowance } from "@/lib/approve";

const ZeroXBaseUrlByChain: { [key: number]: string } = {
  1: "https://api.0x.org/",

}

interface BaseProps {
  chainId: number;
  sellToken: Address;
  buyToken: Address;
  amount: number;
  account: Address;
  zapProvider: ZapProvider,
  slippage?: number; // slippage allowance in BPS 
  tradeTimeout?: number; // in s
}

interface ZapProps extends BaseProps {
  clients: Clients;
}


async function getZapTransaction({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage = 100, tradeTimeout = 60 }: BaseProps): Promise<any> {
  switch (zapProvider) {
    case ZapProvider.enso:
      return (await axios.get(
        `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${account}&spender=${account}&receiver=${account}&amountIn=${amount.toLocaleString("fullwide", { useGrouping: false })}&slippage=${slippage}&tokenIn=${sellToken}&tokenOut=${buyToken}`,
        { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } }
      )).data.tx
    case ZapProvider.zeroX:
      return (await axios.get(
        `${ZeroXBaseUrlByChain[chainId]}swap/v1/quote?buyToken=${buyToken}&sellAmount=${amount.toLocaleString("fullwide", { useGrouping: false })}&slippagePercentage=${slippage / 10_000}&tokenIn=${sellToken}&tokenOut=${buyToken}`,
        { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } }
      )).data
    case ZapProvider.oneInch:
      const txRes = (await axios.get("https://api.1inch.dev/swap/v5.2/1/swap", {
        headers: {
          "Authorization": "Bearer PrbaHy9UX9eBMZ6adKeqXRc0S0dFQ75I"
        },
        params: {
          "src": sellToken,
          "dst": buyToken,
          "amount": amount.toLocaleString("fullwide", { useGrouping: false }),
          "from": account,
          "slippage": "0"
        }
      })).data
      return { from: txRes.from, to: txRes.to, data: txRes.data, value: txRes.value }
  }
}

export default async function zap({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage = 100, tradeTimeout = 60, clients }: ZapProps): Promise<boolean> {
  const transaction = await getZapTransaction({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
  try {
    const hash = await clients.walletClient.sendTransaction(transaction)
    const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
    showSuccessToast("Zapped successfully")
    return true;
  } catch (error: any) {
    showErrorToast(error.shortMessage)
    return false;
  }
}

interface HandleZapAllowanceProps {
  token: Address;
  amount: number;
  account: Address;
  zapProvider: ZapProvider;
  clients: Clients;
}

const OneInchRouterByChain: AddressByChain = {
  1: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  137: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  10: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  42161: "0x1111111254EEB25477B68fb85Ed929f73A960582"
}

async function getZapSpender({ account, chainId, zapProvider }: { account: Address, chainId: number, zapProvider: ZapProvider }): Promise<Address> {
  switch (zapProvider) {
    case ZapProvider.enso:
      const ensoWallet = (await axios.get(
        `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${account}`,
        { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } })
      ).data
      return getAddress(ensoWallet.address)
    case ZapProvider.zeroX:
      return zeroAddress
    case ZapProvider.oneInch:
      return getAddress(OneInchRouterByChain[chainId])
    default:
      return zeroAddress
  }
}

export async function handleZapAllowance({ token, amount, account, zapProvider, clients }: HandleZapAllowanceProps) {
  return handleAllowance({ token, amount, account, spender: await getZapSpender({ account, chainId: clients.walletClient.chain?.id || 1, zapProvider }), clients })
}

interface GetZapProviderProps {
  sellToken: Address;
  buyToken: Address;
  amount: number;
  chainId: number;
  account: Address;
}

interface GetZapQuoteProps extends GetZapProviderProps {
  zapProvider: ZapProvider
}

async function getZapQuote({ sellToken, buyToken, amount, chainId, account, zapProvider }: GetZapQuoteProps): Promise<{ zapProvider: ZapProvider, out: number }> {
  switch (zapProvider) {
    case ZapProvider.enso:
      try {
        const ensoRes = (await axios.get(`https://api.enso.finance/api/v1/shortcuts/quote?chainId=${chainId}&fromAddress=${account}&tokenIn=${sellToken}&tokenOut=${buyToken}&amountIn=${amount.toLocaleString("fullwide", { useGrouping: false })}`,
          { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } })
        ).data
        return { zapProvider, out: Number(ensoRes.amountOut) }
      } catch {
        return { zapProvider: ZapProvider.none, out: 0 }
      }
    case ZapProvider.zeroX:
      return { zapProvider: ZapProvider.none, out: 0 }
    case ZapProvider.oneInch:
      try {
        const oneInchRes = (await axios.get("https://api.1inch.dev/swap/v5.2/1/quote", {
          headers: {
            "Authorization": "Bearer PrbaHy9UX9eBMZ6adKeqXRc0S0dFQ75I"
          },
          params: {
            src: sellToken,
            ds: buyToken,
            amount: amount.toLocaleString("fullwide", { useGrouping: false }),
          }
        })).data
        return { zapProvider, out: Number(oneInchRes.toAmount) }
      } catch {
        return { zapProvider: ZapProvider.none, out: 0 }
      }
    default:
      return { zapProvider: ZapProvider.none, out: 0 }
  }
}

const ZAP_PROVIDER = [ZapProvider.enso, ZapProvider.zeroX, ZapProvider.oneInch]

export async function getZapProvider({ sellToken, buyToken, amount, chainId, account }: GetZapProviderProps): Promise<ZapProvider> {
  const quotes = await Promise.all(ZAP_PROVIDER.map(async zapProvider => getZapQuote({ sellToken, buyToken, amount, chainId, account, zapProvider })))
  const sorted = quotes.sort((a, b) => a.out - b.out)
  return sorted[0].zapProvider
} 