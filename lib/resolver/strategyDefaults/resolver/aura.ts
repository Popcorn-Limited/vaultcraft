import { StrategyDefaultResolverParams } from "..";
import getAuraPools from "@/lib/external/aura/getAuraPools";

export async function aura({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
    const pools = await getAuraPools(chainId)
    const pool = pools.filter(pool => !pool.isShutdown).find(pool => pool.lpToken.address.toLowerCase() === address.toLowerCase())
    return [pool !== undefined ? pool.id : 0] // TODO this should be a number we can clearly distinguish as wrong --> maybe undefined?
}