import { Address, getAddress, zeroAddress } from "viem"
import { mainnet, optimism, polygon, arbitrum, xLayer } from "viem/chains"
import { BaseZapProps } from "."
import axios from "axios"
import { ZapProvider, AddressByChain, Transaction } from "@/lib/types"
import { ZapQuote } from "./zapQuote"

const ParaSwapRouterByChain: AddressByChain = {
  [mainnet.id]: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  [polygon.id]: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  [optimism.id]: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  [arbitrum.id]: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
  [xLayer.id]: zeroAddress
}

export function getParaSwapSpender({ account, chainId }: { account: Address, chainId: number }): Address {
  return getAddress(ParaSwapRouterByChain[chainId])
}

export async function getParaSwapQuote({
  chainId,
  sellToken,
  buyToken,
  amount,
  account,
  zapProvider,
  slippage = 100,
  tradeTimeout = 60
}: BaseZapProps): Promise<ZapQuote> {
  try {
    const res = await getParaSwapZap({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
    if (res) {
      return { zapProvider: ZapProvider.paraSwap, out: res.out }
    } else {
      return { zapProvider: ZapProvider.notFound, out: 0 }
    }
  } catch (error) {
    return { zapProvider: ZapProvider.notFound, out: 0 }
  }
}

export async function getParaSwapTransaction({
  chainId,
  sellToken,
  buyToken,
  amount,
  account,
  zapProvider,
  slippage = 100,
  tradeTimeout = 60
}: BaseZapProps): Promise<Transaction> {
  const res = await getParaSwapZap({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
  if (res) {
    return res.tx
  } else {
    return { from: zeroAddress, to: zeroAddress, data: zeroAddress, value: BigInt(0) }
  }
}

async function getParaSwapZap({
  chainId,
  sellToken,
  buyToken,
  amount,
  account,
  zapProvider,
  slippage = 100,
  tradeTimeout = 60
}: BaseZapProps): Promise<{ tx: Transaction, out: number } | null> {
  try {
    const {
      data: { priceRoute }
    } = await axios.get(`https://api.paraswap.io/prices?srcToken=${sellToken.address}&destToken=${buyToken.address}&amount=${amount.toLocaleString("fullwide", { useGrouping: false })}&srcDecimals=${sellToken.decimals}&destDecimals=${buyToken.decimals}&side=SELL&network=${chainId}&version=6.2`);

    const { data: paraSwapData } = await axios.post(`https://api.paraswap.io/transactions/${chainId}`, {
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

    return {
      tx: {
        from: account,
        to: paraSwapData.to,
        data: paraSwapData.data,
        value: BigInt(paraSwapData.value)
      },
      out: Number(priceRoute.destAmount)
    }
  } catch (error) {
    return null
  }
}

