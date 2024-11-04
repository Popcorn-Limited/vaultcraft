import { Address, getAddress, zeroAddress } from "viem"
import { mainnet, optimism, polygon, arbitrum, xLayer } from "viem/chains"
import { BaseZapProps } from "."
import axios from "axios"
import { ZapProvider, AddressByChain, Transaction } from "@/lib/types"
import { ZapQuote } from "./zapQuote"


const OneInchRouterByChain: AddressByChain = {
  [mainnet.id]: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  [polygon.id]: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  [optimism.id]: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  [arbitrum.id]: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  [xLayer.id]: zeroAddress
}

export function getOneInchSpender({ account, chainId }: { account: Address, chainId: number }): Address {
  return getAddress(OneInchRouterByChain[chainId])
}

export async function getOneInchQuote({
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
    const res = await getOneInchZap({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
    if (res) {
      return { zapProvider: ZapProvider.oneInch, out: res.out }
    } else {
      return { zapProvider: ZapProvider.notFound, out: 0 }
    }
  } catch (error) {
    return { zapProvider: ZapProvider.notFound, out: 0 }
  }
}

export async function getOneInchTransaction({
  chainId,
  sellToken,
  buyToken,
  amount,
  account,
  zapProvider,
  slippage = 100,
  tradeTimeout = 60
}: BaseZapProps): Promise<Transaction> {
  const res = await getOneInchZap({ chainId, sellToken, buyToken, amount, account, zapProvider, slippage, tradeTimeout })
  if (res) {
    return res.tx
  } else {
    return { from: zeroAddress, to: zeroAddress, data: zeroAddress, value: BigInt(0) }
  }
}

async function getOneInchZap({
  chainId,
  sellToken,
  buyToken,
  amount,
  account,
  zapProvider,
  slippage = 100,
  tradeTimeout = 60
}: BaseZapProps): Promise<{ tx: Transaction, out: number } | null> {

  // !!! NEED TO FINISH KYB/KYC TO USE 1INCH !!! //

  // const oneInchRes = (await axios.get("https://api.1inch.dev/swap/v6.0/1/quote", {
  //   headers: {
  //     "Authorization": "Bearer PrbaHy9UX9eBMZ6adKeqXRc0S0dFQ75I"
  //   },
  //   params: {
  //     src: sellToken.address,
  //     dst: buyToken.address,
  //     amount: amount.toLocaleString("fullwide", { useGrouping: false })
  //   }
  // })).data
  return null
}

