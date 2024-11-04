import { Address, getAddress, zeroAddress } from "viem"
import { mainnet, optimism, polygon, arbitrum, xLayer } from "viem/chains"
import { BaseZapProps } from "."
import { ALT_NATIVE_ADDRESS } from "@/lib/constants"
import axios from "axios"
import { ZapProvider, AddressByChain, Transaction } from "@/lib/types"
import { ZapQuote } from "./zapQuote"


const EnsoRouterByChain: AddressByChain = {
  [mainnet.id]: "0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E",
  [polygon.id]: "0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E",
  [optimism.id]: "0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E",
  [arbitrum.id]: "0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E",
  [xLayer.id]: zeroAddress
}

export function getEnsoSpender({ account, chainId }: { account: Address, chainId: number }): Address {
  return getAddress(EnsoRouterByChain[chainId])
}

export async function getEnsoQuote({
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
    const ensoRes = await getEnsoZap({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
    if (ensoRes) {
      return { zapProvider: ZapProvider.enso, out: ensoRes.out }
    } else {
      return { zapProvider: ZapProvider.notFound, out: 0 }
    }
  } catch (error) {
    return { zapProvider: ZapProvider.notFound, out: 0 }
  }
}

export async function getEnsoTransaction({
  chainId,
  sellToken,
  buyToken,
  amount,
  account,
  zapProvider,
  slippage = 100,
  tradeTimeout = 60
}: BaseZapProps): Promise<Transaction> {
  const ensoRes = await getEnsoZap({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
  if (ensoRes) {
    return ensoRes.tx
  } else {
    return { from: zeroAddress, to: zeroAddress, data: zeroAddress, value: BigInt(0) }
  }
}

async function getEnsoZap({
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
    const sellTokenAddress = sellToken.address === ALT_NATIVE_ADDRESS ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" : sellToken.address
    const buyTokenAddress = buyToken.address === ALT_NATIVE_ADDRESS ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" : buyToken.address
    const ensoRes = (await axios.get(
      `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${account}&spender=${account}&receiver=${account}&amountIn=${amount.toLocaleString("fullwide", { useGrouping: false })}&slippage=${slippage}&tokenIn=${sellTokenAddress}&tokenOut=${buyTokenAddress}&routingStrategy=router`,
      { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } }
    )).data

    return {
      tx: {
        from: account,
        to: ensoRes.tx.to,
        data: ensoRes.tx.data,
        value: BigInt(ensoRes.tx.value)
      },
      out: Number(ensoRes.amountOut)
    }
  } catch (error) {
    return null
  }
}

