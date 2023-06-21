import axios from "axios";
import { findAllRoutes } from "@/lib/external/curve/router";
import { IDict, PoolResponse } from "@/lib/external/curve/router/interfaces";

const chainIdToNetwork: { [key: number]: string } = {
  1: "ethereum",
  10: "optimism",
  42161: "arbitrum",
  137: "polygon",
  250: "fantom",
  1284: "moonbeam",
  43114: "avalanche",
  42220: "celo",
  1313161554: "aurora",
  2222: "kava",
  100: "xdai",
}

export async function curveCompounder({ chainId, address }: { chainId: number, address: string }): Promise<any[]> {
  const network = chainIdToNetwork[chainId]
  const allPools: IDict<PoolResponse> = await axios.get("https://api.curve.fi/api/getPools/all")
  const pools = Object.entries(allPools).map(([key, pool]) => pool).filter(pool => pool.blockchainId === network)
  const ADict = pools.map(pool => { return { [pool.address]: Number(pool.amplificationCoefficient) } })
  const tvlDict = pools.map(pool => { return { [pool.address]: pool.usdTotal } })
  findAllRoutes
}
