import { Address, zeroAddress } from "viem";
import { Token, ZapProvider } from "@/lib/types";
import { getZapSpender } from "./zapAllowance";
import { getEnsoQuote } from "./enso";
import { getOneInchQuote } from "./oneInch";
import { getParaSwapQuote } from "./paraswap";
import { getKyberSwapQuote } from "./kyperswap";
import { getOpenOceanQuote } from "./openOcean";

export interface GetZapProviderProps {
  sellToken: Token;
  buyToken: Token;
  amount: number;
  chainId: number;
  account: Address;
  feeRecipient: Address;
}

export interface GetZapQuoteProps extends GetZapProviderProps {
  zapProvider: ZapProvider
}

export type ZapQuote = {
  zapProvider: ZapProvider;
  out: number;
}

export async function getZapQuote({ sellToken, buyToken, amount, chainId, account, zapProvider, feeRecipient }: GetZapQuoteProps): Promise<ZapQuote> {
  // Check if ZapProvider is supported on that chain
  const spender = getZapSpender({ account, chainId, zapProvider })
  if (spender === zeroAddress) return { zapProvider: ZapProvider.notFound, out: 0 }

  // Fetch Quote
  switch (zapProvider) {
    case ZapProvider.enso:
      return getEnsoQuote({ sellToken, buyToken, amount, chainId, account, zapProvider })
    case ZapProvider.oneInch:
      return getOneInchQuote({ sellToken, buyToken, amount, chainId, account, zapProvider })
    case ZapProvider.paraSwap:
      return getParaSwapQuote({ sellToken, buyToken, amount, chainId, account, zapProvider })
    case ZapProvider.kyberSwap:
      return getKyberSwapQuote({ sellToken, buyToken, amount, chainId, account, zapProvider })
    case ZapProvider.openOcean:
      return getOpenOceanQuote({ sellToken, buyToken, amount, chainId, account, zapProvider })
    // Not supported
    case ZapProvider.zeroX:
    case ZapProvider.kelp:
    default:
      return { zapProvider: ZapProvider.notFound, out: 0 }
  }
}