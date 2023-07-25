import getAuraPools from "@/lib/external/aura/getAuraPools"

export async function balancer({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  const pools = await getAuraPools(chainId)
  const pool = pools.find(pool => pool.lpToken.address.toLowerCase() === address.toLowerCase())

  if (pool === undefined) return 0

  const balApy = pool.aprs.breakdown.find(breakdown => breakdown.name === 'BAL')
  const feeApy = pool.aprs.breakdown.find(breakdown => breakdown.name === 'Swap fees')

  return (balApy?.value || 0) + (feeApy?.value || 0)
}