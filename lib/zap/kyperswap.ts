import { Address, getAddress, zeroAddress } from "viem"
import { mainnet, optimism, polygon, arbitrum, xLayer } from "viem/chains"
import { BaseZapProps } from "."
import axios from "axios"
import { ZapProvider, AddressByChain, Transaction } from "@/lib/types"
import { networkMap } from "@/lib/utils/connectors"
import { ZapQuote } from "./zapQuote"

const KyberswapRouterByChain: AddressByChain = {
  [mainnet.id]: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  [polygon.id]: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  [optimism.id]: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  [arbitrum.id]: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
  [xLayer.id]: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5"
}

export function getKyberSwapSpender({ account, chainId }: { account: Address, chainId: number }): Address {
  return getAddress(KyberswapRouterByChain[chainId])
}

export async function getKyberSwapQuote({
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
    const res = await getKyberSwapZap({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
    if (res && res?.out > 0) {
      return { zapProvider: ZapProvider.kyberSwap, out: res.out }
    } else {
      return { zapProvider: ZapProvider.notFound, out: 0 }
    }
  } catch (error) {
    return { zapProvider: ZapProvider.notFound, out: 0 }
  }
}

export async function getKyberSwapTransaction({
  chainId,
  sellToken,
  buyToken,
  amount,
  account,
  zapProvider,
  slippage = 100,
  tradeTimeout = 60
}: BaseZapProps): Promise<Transaction> {
  const res = await getKyberSwapZap({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
  if (res) {
    return res.tx
  } else {
    return { from: zeroAddress, to: zeroAddress, data: zeroAddress, value: BigInt(0) }
  }
}

async function getKyberSwapZap({
  chainId,
  sellToken,
  buyToken,
  amount,
  account,
  zapProvider,
  slippage = 100,
  tradeTimeout = 60
}: BaseZapProps): Promise<{ tx: Transaction, out: number } | null> {
  const targetPathConfig = {
    params: {
      tokenIn: sellToken.address,
      tokenOut: buyToken.address,
      amountIn: amount.toLocaleString("fullwide", { useGrouping: false })
    }
  };

  const { data: kyberRoute } = await axios.get(
    `https://aggregator-api.kyberswap.com/${networkMap[chainId].toLowerCase()}/api/v1/routes`,
    targetPathConfig
  )

  if (kyberRoute.message === "successfully") {
    // Configure the request body (refer to Docs for the full list)
    const requestBody = {
      routeSummary: kyberRoute.data.routeSummary,
      sender: account,
      recipient: account,
      slippageTolerance: slippage / 10 // Kyberswap has a maximum slippage value of 1_000 where we use 10_000
    }

    const { data: kyberSwapData } = await axios.post(
      `https://aggregator-api.kyberswap.com/${networkMap[chainId].toLowerCase()}/api/v1/route/build`,
      requestBody
    )

    if (kyberSwapData.message === "successfully") {
      return {
        tx: {
          from: account,
          to: kyberSwapData.data.routerAddress,
          data: kyberSwapData.data.data,
          value: BigInt(kyberSwapData.data.transactionValue)
        },
        out: Number(kyberSwapData.data.amountOut)
      }
    } else {
      // Route call failed
      return null
    }
  } else {
    // Quote call failed
    return null
  }
}

