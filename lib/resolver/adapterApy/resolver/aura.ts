import getAuraPools from "@/lib/external/aura/getAuraPools"

export async function aura({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  const pools = await getAuraPools(chainId)
  const pool = pools.find(pool => pool.lpToken.address.toLowerCase() === address.toLowerCase())
  return pool === undefined ? 0 : pool.aprs.total
}