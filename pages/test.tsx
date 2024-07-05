import { getVotePeriodEndTime } from "@/lib/gauges/utils"
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"

export default function Test() {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
  })
  publicClient.getBlock().then(res => console.log(res))
  return <></>
}