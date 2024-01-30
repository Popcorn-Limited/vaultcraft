import type { LlamaPool, ProtocolName, Yield } from "src/yieldOptions/types.js";
import { Address, getAddress } from "viem";
import { Clients, IProtocol, getEmptyYield } from "./index.js";
import NodeCache from "node-cache";
import axios from "axios";


const PIREX_ASSETS: { [key: number]: Address[] } = {
  1: [
    "0xBCe0Cf87F513102F22232436CCa2ca49e815C3aC", // pxCVX
  ],
  42161: [
    "0x9A592B4539E22EeB8B2A3Df679d572C7712Ef999", //pxGMX 
  ]
}

const assetToPoolId: { [key: string]: string } = {
  "0xBCe0Cf87F513102F22232436CCa2ca49e815C3aC": "777032e6-e815-4f44-90b4-abb98f0f9632",
  "0x9A592B4539E22EeB8B2A3Df679d572C7712Ef999": "4df7d373-6214-4a73-9bd3-ca6e5683d846"
}

// pirex doesnt offer any api currently to get the correct apy
// therefore they mentioned we should pull the underlying apy of the asset and compound it
// the multiplier to get to the rough apy of pirex was tested manually and might be off.
// TODO - we should definitely find a more robust way to calculate this
const COMPOUNDING_MULTIPLIER = 0.69

export class Pirex implements IProtocol {
  private clients: Clients;
  private cache: NodeCache;

  constructor(clients: Clients, ttl: number) {
    this.clients = clients;
    this.cache = new NodeCache({ stdTTL: ttl });
  }

  key(): ProtocolName {
    return "pirex";
  }

  async getApy(chainId: number, asset: Address): Promise<Yield> {
    const client = this.clients[chainId];
    if (!client) throw new Error(`Missing public client for chain ID: ${chainId}`);

    let pools = this.cache.get("llama-pools") as LlamaPool[];
    if (!pools) {
      const res = (await axios.get("https://yields.llama.fi/pools")).data;
      pools = res.data;
      this.cache.set("llama-pools", pools);
    }

    const pool = pools.find(pool => pool.pool === assetToPoolId[PIREX_ASSETS[chainId][0]])

    return pool ? {
      total: pool.apy / COMPOUNDING_MULTIPLIER,
      apy: [{
        rewardToken: getAddress(asset),
        apy: pool.apy / COMPOUNDING_MULTIPLIER
      }]
    } : getEmptyYield(asset);
  }

  getAssets(chainId: number): Promise<Address[]> {
    const client = this.clients[chainId];
    if (!client) throw new Error(`Missing public client for chain ID: ${chainId}`);

    return Promise.resolve(PIREX_ASSETS[chainId].map(asset => getAddress(asset)))
  }
}