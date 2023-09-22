import { RPC_URLS } from "@/lib/connectors";
import { convexBoosterAbi, CONVEX_BOOSTER_ADDRESS } from "@/lib/external/convex";
import { createPublicClient, http } from "viem";
import { mainnet } from "wagmi";

export default async function getConvexPools({ chainId }: { chainId: number }): Promise<any[]> {
  // TODO -- temp solution, we should pass the client into the function
  const client = createPublicClient({
    chain: mainnet,
    // @ts-ignore
    transport: http(RPC_URLS[chainId])
  })

  const poolLength = await client.readContract({
    // @ts-ignore
    address: CONVEX_BOOSTER_ADDRESS[chainId],
    abi: convexBoosterAbi,
    functionName: "poolLength"
  }) as BigInt

  const poolInfos = await client.multicall({
    contracts: Array(Number(poolLength)).fill(undefined).map((item, idx) => {
      return {
        // @ts-ignore
        address: CONVEX_BOOSTER_ADDRESS[chainId],
        abi: convexBoosterAbi,
        functionName: "poolInfo",
        args: [idx]
      }
    })
  })

  return poolInfos.filter(token => token.status === "success").map((poolInfo: any) => { return { lpToken: poolInfo.result[0], token: poolInfo.result[1], gauge: poolInfo.result[2], crvRewards: poolInfo.result[3], stash: poolInfo.result[4], shutdown: poolInfo.result[5] } })
}