import { FraxLendAbi } from "@/lib/constants"
import { LlamaApy } from "@/lib/types"
import { ChainById, RPC_URLS } from "@/lib/utils/connectors"
import { Address, createPublicClient, http } from "viem"

export default async function getFraxlendApy(address: Address, chainId: number): Promise<LlamaApy[]> {
  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId]),
  })

  const currentRateInfo = await client.readContract({
    address: address,
    abi: FraxLendAbi,
    functionName: "currentRateInfo"
  })
  const apy = (Number(currentRateInfo[3]) * 31557600) / 1e16 // (borrowRate per second * seconds per year) / 1e18 * 100

  return [{ apy: apy, apyBase: apy, apyReward: 0, date: new Date() }]
}