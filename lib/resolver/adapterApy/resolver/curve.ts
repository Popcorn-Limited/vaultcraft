const NETWORK_NAMES = { 1: "ethereum", 1337: "ethereum", 10: "optimism", 137: "polygon", 250: "fantom", 42161: "arbitrum" }

export async function curve({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  // @ts-ignore
  const network = NETWORK_NAMES[chainId]
  const main = await (await fetch(`https://api.curve.fi/api/getPools/${network}/main`)).json()
  const crypto = await (await fetch(`https://api.curve.fi/api/getPools/${network}/crypto`)).json()
  const factory = await (await fetch(`https://api.curve.fi/api/getPools/${network}/factory`)).json()
  const factoryCrypto = await (await fetch(`https://api.curve.fi/api/getPools/${network}/factory-crypto`)).json()
  const factoryCrvusd = await (await fetch(`https://api.curve.fi/api/getPools/${network}/factory-crvusd`)).json()
  const factoryTtricrypto = await (await fetch(`https://api.curve.fi/api/getPools/${network}/factory-tricrypto`)).json()
  const allPools = [...main.data.poolData, ...crypto.data.poolData, ...factory.data.poolData, ...factoryCrypto.data.poolData, ...factoryCrvusd.data.poolData, ...factoryTtricrypto.data.poolData]

  const pool = allPools.find(pool => pool.lpTokenAddress.toLowerCase() === address.toLowerCase())
  return pool === undefined ? 0 : (pool.gaugeCrvApy[0] || 0)
}

