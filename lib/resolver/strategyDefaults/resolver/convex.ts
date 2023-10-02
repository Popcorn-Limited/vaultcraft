import { getConvexPools } from "@/lib/external/convex";
import { getAddress } from "viem";
import { StrategyDefaultResolverParams } from "..";

export async function convex({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
    const pools = await getConvexPools({ chainId, client });
    return [pools.map(item => getAddress(item.lpToken)).indexOf(address)];
}