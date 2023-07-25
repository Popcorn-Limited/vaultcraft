import getAuraPools from "@/lib/external/aura/getAuraPools";

export async function aura({ chainId }: { chainId: number }): Promise<any[]> {
    const pools = await getAuraPools(chainId)

    return pools.filter(pool => !pool.isShutdown).map(pool => pool.lpToken.address)
}