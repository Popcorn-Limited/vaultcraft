import { RPC_PROVIDERS, networkMap } from "@/lib/connectors";
import { Contract } from "ethers";

interface Pool {
  chain: string;
  project: string;
  underlyingTokens: string[];
  apy: number;
}

const NETWORK_NAMES = { 1: "Ethereum", 1337: "Ethereum", 10: "Optimism", 137: "Polygon", 250: "Fantom", 42161: "Arbitrum" }

export async function stargate({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  const sToken = new Contract(address,
    ["function token() external view returns (address)"],
    // @ts-ignore
    RPC_PROVIDERS[chainId])

  const token = await sToken.token()
  const pools = await (await fetch("https://yields.llama.fi/pools")).json();

  // @ts-ignore
  const filteredPools: Pool[] = pools.data.filter((pool: Pool) => pool.chain === networkMap[chainId] && pool.project === "stargate")
  const pool = filteredPools.find(pool => pool.underlyingTokens[0].toLowerCase() === token.toLowerCase())
  return pool === undefined ? 0 : pool.apy
}
