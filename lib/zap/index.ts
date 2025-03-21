import { Address, zeroAddress } from "viem";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts";
import { Clients, Token, TokenByAddress, ZapProvider, Transaction } from "@/lib/types";
import { formatBalance } from "@/lib/utils/helpers";
import { getEnsoTransaction } from "./enso";
import { getOneInchTransaction } from "./oneInch";
import { getParaSwapTransaction } from "./paraswap";
import { getKyberSwapTransaction } from "./kyperswap";
import { getOpenOceanTransaction } from "./openOcean";
import { ChainById } from "@/lib/utils/connectors";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { getKelpTransaction } from "./kelp";

export interface BaseZapProps {
  chainId: number;
  sellToken: Token;
  buyToken: Token;
  amount: number;
  account: Address;
  zapProvider: ZapProvider,
  slippage?: number; // slippage allowance in BPS 
  tradeTimeout?: number; // in s
}

interface ZapProps extends BaseZapProps {
  clients: Clients;
  tokensAtom: [{ [key: number]: TokenByAddress }, Function]
}

async function getZapTransaction({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage = 100, tradeTimeout = 60 }: BaseZapProps): Promise<Transaction> {
  switch (zapProvider) {
    case ZapProvider.enso:
      return getEnsoTransaction({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
    case ZapProvider.oneInch:
      return getOneInchTransaction({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
    case ZapProvider.paraSwap:
      return getParaSwapTransaction({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
    case ZapProvider.kyberSwap:
      return getKyberSwapTransaction({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
    case ZapProvider.openOcean:
      return getOpenOceanTransaction({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
    case ZapProvider.kelp:
      return getKelpTransaction({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
    // Not yet supported
    case ZapProvider.zeroX:
    default:
      return { from: zeroAddress, to: zeroAddress, data: zeroAddress, value: BigInt(0) }

  }
}

export default async function zap({
  chainId,
  sellToken,
  buyToken,
  amount,
  account,
  zapProvider,
  slippage = 100,
  tradeTimeout = 60,
  clients,
  tokensAtom }: ZapProps): Promise<boolean> {
  showLoadingToast(`Selling ${formatBalance(amount, sellToken.decimals)} ${sellToken.symbol} for ${buyToken.symbol} using ${String(ZapProvider[zapProvider])}...`)

  const transaction = await getZapTransaction({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })

  try {
    const hash = await clients.walletClient.sendTransaction({ 
      chain: ChainById[chainId], 
      account, 
      to: transaction.to,
      data: transaction.data as `0x${string}`,
      value: transaction.value 
      })
    const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })

    showSuccessToast(`Sold ${formatBalance(amount, sellToken.decimals)} ${sellToken.symbol} for ${buyToken.symbol} using ${String(ZapProvider[zapProvider])} !`)

    await mutateTokenBalance({
      tokensToUpdate: [sellToken.address, buyToken.address],
      account,
      tokensAtom,
      chainId
    })

    return true;
  } catch (error: any) {
    showErrorToast(error.shortMessage);
    return false;
  }
}