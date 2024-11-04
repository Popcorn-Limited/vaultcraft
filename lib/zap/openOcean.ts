import { Address, createPublicClient, getAddress, http, zeroAddress } from "viem"
import { mainnet, optimism, polygon, arbitrum, xLayer } from "viem/chains"
import { BaseZapProps } from "."
import { ALT_NATIVE_ADDRESS, FeeRecipientByChain } from "@/lib/constants"
import axios from "axios"
import { ZapProvider, AddressByChain, Transaction } from "@/lib/types"
import { RPC_URLS, ChainById } from "@/lib/utils/connectors"
import { ZapQuote } from "./zapQuote"

const OpenOceanChainName: { [key: number]: string } = {
  1: "eth",
  42161: "arbitrum",
  137: "polygon",
  8453: "base",
  43114: "avax",
  10: "optimism",
  56: "bsc",
}

const OpenOceanNativeToken: { [key: number]: string } = {
  1: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  42161: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  137: "0x0000000000000000000000000000000000001010",
  8453: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  43114: "0x0000000000000000000000000000000000000000",
  10: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  56: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
}

const OpenOceanRouterByChain: AddressByChain = {
  [mainnet.id]: "0x6352a56caadC4F1E25CD6c75970Fa768A3304e64",
  [polygon.id]: "0x6352a56caadC4F1E25CD6c75970Fa768A3304e64",
  [optimism.id]: "0x6352a56caadC4F1E25CD6c75970Fa768A3304e64",
  [arbitrum.id]: "0x6352a56caadC4F1E25CD6c75970Fa768A3304e64",
  [xLayer.id]: zeroAddress
}

export function getOpenOceanSpender({ account, chainId }: { account: Address, chainId: number }): Address {
  return getAddress(OpenOceanRouterByChain[chainId])
}

export async function getOpenOceanQuote({
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
    const res = await getOpenOceanZap({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
    if (res) {
      return { zapProvider: ZapProvider.openOcean, out: res.out }
    } else {
      return { zapProvider: ZapProvider.notFound, out: 0 }
    }
  } catch (error) {
    return { zapProvider: ZapProvider.notFound, out: 0 }
  }
}

export async function getOpenOceanTransaction({
  chainId,
  sellToken,
  buyToken,
  amount,
  account,
  zapProvider,
  slippage = 100,
  tradeTimeout = 60
}: BaseZapProps): Promise<Transaction> {
  const res = await getOpenOceanZap({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
  if (res) {
    return res.tx
  } else {
    return { from: zeroAddress, to: zeroAddress, data: zeroAddress, value: BigInt(0) }
  }
}

async function getOpenOceanZap({
  chainId,
  sellToken,
  buyToken,
  amount,
  account,
  zapProvider,
  slippage = 100,
  tradeTimeout = 60
}: BaseZapProps): Promise<{ tx: Transaction, out: number } | null> {
  const publicClient = createPublicClient({ chain: ChainById[chainId], transport: http(RPC_URLS[chainId]) })
  const gasPrice = await publicClient.getGasPrice()

  const tokenIn = sellToken.address === ALT_NATIVE_ADDRESS ? OpenOceanNativeToken[chainId] : sellToken.address
  const tokenOut = buyToken.address === ALT_NATIVE_ADDRESS ? OpenOceanNativeToken[chainId] : buyToken.address

  const { data } = await axios.get(`https://open-api.openocean.finance/v4/${OpenOceanChainName[chainId]}/swap?inTokenAddress=${tokenIn}&outTokenAddress=${tokenOut}&amount=${amount / (10 ** sellToken.decimals)}&gasPrice=${gasPrice}&slippage=${slippage / 10_000}&account=${account}&referrer=${FeeRecipientByChain[chainId]}`)

  if (data.code === 200) {
    return {
      tx: {
        from: account,
        to: data.data.to,
        data: data.data.data,
        value: BigInt(data.data.value)
      },
      out: Number(data.data.outAmount)
    }
  } else {
    return null
  }
}

