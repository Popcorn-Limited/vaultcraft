import {
  convexBoosterAbi,
  CONVEX_BOOSTER_ADDRESS,
} from "@/lib/external/convex";
import { Address, PublicClient, getAddress } from "viem";

interface PoolInfo {
  lpToken: Address;
  token: Address;
  gauge: Address;
  crvRewards: Address;
  stash: Address;
  shutdown: boolean;
}

export default async function getConvexPools({
  chainId,
  client,
}: {
  chainId: number;
  client: PublicClient;
}): Promise<PoolInfo[]> {
  const poolLength = await client.readContract({
    address: CONVEX_BOOSTER_ADDRESS[chainId],
    abi: convexBoosterAbi,
    functionName: "poolLength",
  });

  const poolInfos = await client.multicall({
    contracts: Array(Number(poolLength))
      .fill(undefined)
      .map((item, idx) => {
        return {
          address: CONVEX_BOOSTER_ADDRESS[chainId],
          abi: convexBoosterAbi,
          functionName: "poolInfo",
          args: [idx],
        };
      }),
  });

  return poolInfos
    .filter((token: any) => token.status === "success")
    .map((poolInfo: any) => {
      return {
        lpToken: getAddress(poolInfo.result[0]),
        token: getAddress(poolInfo.result[1]),
        gauge: getAddress(poolInfo.result[2]),
        crvRewards: getAddress(poolInfo.result[3]),
        stash: getAddress(poolInfo.result[4]),
        shutdown: poolInfo.result[5],
      };
    });
}
