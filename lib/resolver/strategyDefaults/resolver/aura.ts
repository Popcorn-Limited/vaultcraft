import { Address } from "viem";
import getAuraPools from "@/lib/external/aura/getAuraPools";

export async function aura({ chainId, address }: { chainId: number, address: Address }): Promise<any[]> {
    const pools = await getAuraPools(chainId)
    const pool = pools.filter(pool => !pool.isShutdown).find(pool => pool.lpToken.address.toLowerCase() === address.toLowerCase())
    return [pool !== undefined ? pool.id : 0] // TODO this should be a number we can clearly distinguish as wrong --> maybe undefined?
}