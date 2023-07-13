interface Pool {
  chain: string;
  project: string;
  underlyingTokens: string[];
  apy: number;
}

const NETWORK_NAMES = { 1: "Ethereum", 1337: "Ethereum", 10: "Optimism", 137: "Polygon", 250: "Fantom", 42161: "Arbitrum" }

export async function stargate({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  const pools: Pool[] = await (await fetch("https://yields.llama.fi/pools")).json();
  // @ts-ignore
  const filteredPools = pools.filter(pool => pool.chain === NETWORK_NAMES[chainId] && pool.project === "stargate")
  const pool = filteredPools.find(pool => pool.underlyingTokens[0].toLowerCase() === address.toLowerCase())
  return pool === undefined ? 0 : pool.apy
}
