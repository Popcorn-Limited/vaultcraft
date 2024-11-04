import { ZapProvider } from "@/lib/types"
import { GetZapProviderProps, getZapQuote } from "./zapQuote"

const ZAP_PROVIDER = [ZapProvider.enso, ZapProvider.zeroX, ZapProvider.oneInch, ZapProvider.paraSwap, ZapProvider.openOcean]

export async function getZapProvider({ sellToken, buyToken, amount, chainId, account, feeRecipient }: GetZapProviderProps): Promise<ZapProvider> {
  const quotes = await Promise.all(ZAP_PROVIDER.map(async zapProvider => getZapQuote({ sellToken, buyToken, amount, chainId, account, zapProvider, feeRecipient })))
  console.log(quotes)
  const sorted = quotes.sort((a, b) => b.out - a.out)
  return sorted[0].zapProvider
} 
