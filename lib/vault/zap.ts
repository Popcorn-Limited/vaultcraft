import axios from "axios"
import { Address, getAddress, zeroAddress } from "viem";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { AddressByChain, Clients, Token, ZapProvider } from "@/lib/types";
import { handleAllowance } from "@/lib/approve";


interface BaseProps {
  chainId: number;
  sellToken: Token;
  buyToken: Token;
  amount: number;
  account: Address;
  zapProvider: ZapProvider,
  slippage?: number; // slippage allowance in BPS 
  tradeTimeout?: number; // in s
}

interface ZapProps extends BaseProps {
  clients: Clients;
}

const ZeroXBaseUrlByChain: { [key: number]: string } = {
  1: "https://api.0x.org/",
}

async function getZapTransaction({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage = 100, tradeTimeout = 60 }: BaseProps): Promise<any> {
  switch (zapProvider) {
    case ZapProvider.enso:
      const ensoRes = (await axios.get(
        `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${account}&spender=${account}&receiver=${account}&amountIn=${amount.toLocaleString("fullwide", { useGrouping: false })}&slippage=${slippage}&tokenIn=${sellToken.address}&tokenOut=${buyToken.address}&routingStrategy=router`,
        { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } }
      )).data
      return ensoRes.tx
    case ZapProvider.zeroX:
      return (await axios.get(
        `${ZeroXBaseUrlByChain[chainId]}swap/v1/quote?buyToken=${buyToken}&sellAmount=${amount.toLocaleString("fullwide", { useGrouping: false })}&slippagePercentage=${slippage / 10_000}&tokenIn=${sellToken.address}&tokenOut=${buyToken.address}`,
        { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } }
      )).data
    case ZapProvider.oneInch:
      const txRes = (await axios.get("https://api.1inch.dev/swap/v5.2/1/swap", {
        headers: {
          "Authorization": "Bearer PrbaHy9UX9eBMZ6adKeqXRc0S0dFQ75I"
        },
        params: {
          "src": sellToken.address,
          "dst": buyToken.address,
          "amount": amount.toLocaleString("fullwide", { useGrouping: false }),
          "from": account,
          "slippage": "0"
        }
      })).data
      return { from: txRes.from, to: txRes.to, data: txRes.data, value: txRes.value }
    case ZapProvider.paraSwap:
      const {
        data: { priceRoute }
      } = await axios.get(`https://apiv5.paraswap.io/prices/?srcToken=${sellToken.address}&destToken=${buyToken.address}&amount=${amount.toLocaleString("fullwide", { useGrouping: false })}&srcDecimals=${sellToken.decimals}&destDecimals=${buyToken.decimals}&side=SELL&network=${chainId}`);

      const { data: paraSwapData } = await axios.post(`https://apiv5.paraswap.io/transactions/${chainId}`, {
        srcToken: sellToken.address,
        destToken: buyToken.address,
        srcAmount: amount.toLocaleString("fullwide", { useGrouping: false }),
        slippage,
        priceRoute,
        userAddress: account,
        partner: "anon",
        srcDecimals: sellToken.decimals,
        destDecimals: buyToken.decimals,
        ignoreChecks: true
      });
      return { from: paraSwapData.from, to: paraSwapData.to, data: paraSwapData.data, value: paraSwapData.value }
  }
}

export default async function zap({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage = 100, tradeTimeout = 60, clients }: ZapProps): Promise<boolean> {
  const transaction = await getZapTransaction({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
  console.log({ transaction })
  try {
    const hash = await clients.walletClient.sendTransaction(transaction)
    const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
    showSuccessToast("Zapped successfully")
    return true;
  } catch (error: any) {
    showErrorToast(error.shortMessage);
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

const EnsoRouterByChain: AddressByChain = {
  1: "0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E",
  137: "0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E",
  10: "0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E",
  42161: "0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E"
}

const OneInchRouterByChain: AddressByChain = {
  1: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  137: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  10: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  42161: "0x1111111254EEB25477B68fb85Ed929f73A960582"
}

const ParaSwapRouterByChain: AddressByChain = {
  1: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  137: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  10: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  42161: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57"
}

async function getZapSpender({ account, chainId, zapProvider }: { account: Address, chainId: number, zapProvider: ZapProvider }): Promise<Address> {
  switch (zapProvider) {
    case ZapProvider.enso:
      return getAddress(EnsoRouterByChain[chainId])
    case ZapProvider.zeroX:
      return zeroAddress
    case ZapProvider.oneInch:
      return getAddress(OneInchRouterByChain[chainId])
    case ZapProvider.paraSwap:
      return getAddress(ParaSwapRouterByChain[chainId])
    default:
      return zeroAddress
  }
}

export async function handleZapAllowance({ token, amount, account, zapProvider, clients }: HandleZapAllowanceProps) {
  if (!clients.walletClient.chain) {
    showErrorToast("Wallet not connected!")
    return false
  }
  const spender = await getZapSpender({ account, chainId: clients.walletClient.chain?.id, zapProvider })
  console.log({ spender })
  return handleAllowance({ token, amount, account, spender, clients })
}

interface GetZapProviderProps {
  sellToken: Token;
  buyToken: Token;
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
        const ensoRes = (await axios.get(`https://api.enso.finance/api/v1/shortcuts/quote?chainId=${chainId}&routingStrategy=router&fromAddress=${account}&tokenIn=${sellToken.address}&tokenOut=${buyToken.address}&amountIn=${amount.toLocaleString("fullwide", { useGrouping: false })}`,
          { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } })
        ).data
        return { zapProvider, out: Number(ensoRes.amountOut) }
      } catch {
        return { zapProvider: ZapProvider.notFound, out: 0 }
      }
    case ZapProvider.zeroX:
      return { zapProvider: ZapProvider.notFound, out: 0 }
    case ZapProvider.oneInch:
      try {
        const oneInchRes = (await axios.get("https://api.1inch.dev/swap/v5.2/1/quote", {
          headers: {
            "Authorization": "Bearer PrbaHy9UX9eBMZ6adKeqXRc0S0dFQ75I"
          },
          params: {
            src: sellToken.address,
            ds: buyToken.address,
            amount: amount.toLocaleString("fullwide", { useGrouping: false }),
          }
        })).data
        return { zapProvider, out: Number(oneInchRes.toAmount) }
      } catch {
        return { zapProvider: ZapProvider.notFound, out: 0 }
      }
    case ZapProvider.paraSwap:
      try {
        const {
          data: { priceRoute }
        } = await axios.get(`https://apiv5.paraswap.io/prices/?srcToken=${sellToken.address}&destToken=${buyToken.address}&amount=${amount.toLocaleString("fullwide", { useGrouping: false })}&srcDecimals=${sellToken.decimals}&destDecimals=${buyToken.decimals}&side=SELL&network=${chainId}`);
        return { zapProvider, out: Number(priceRoute.destAmount) }
      } catch {
        return { zapProvider: ZapProvider.notFound, out: 0 }
      }
    default:
      return { zapProvider: ZapProvider.notFound, out: 0 }
  }
}

const ZAP_PROVIDER = [ZapProvider.enso, ZapProvider.zeroX, ZapProvider.oneInch, ZapProvider.paraSwap]

export async function getZapProvider({ sellToken, buyToken, amount, chainId, account }: GetZapProviderProps): Promise<ZapProvider> {
  const quotes = await Promise.all(ZAP_PROVIDER.map(async zapProvider => getZapQuote({ sellToken, buyToken, amount, chainId, account, zapProvider })))
  const sorted = quotes.sort((a, b) => b.out - a.out)
  return sorted[0].zapProvider
} 
