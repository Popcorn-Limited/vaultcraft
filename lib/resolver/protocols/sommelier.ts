import type { ProtocolName, Yield } from "src/yieldOptions/types.js";
import { Address, PublicClient, getAddress } from "viem";
import { IProtocol } from "./index.js";
import axios from "axios";


const SOMMELIER_ASSETS: Address[] = [
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // WETH
]

interface SommelierApyEntry {
  daily_apy: number;
}

export class Sommelier implements IProtocol {
  private client: PublicClient;
  constructor(client: PublicClient) {
    this.client = client;
  }

  key(): ProtocolName {
    return "sommelier";
  }

  async getApy(chainId: number, asset: Address): Promise<Yield> {
    if (chainId !== 1) throw new Error("Sommelier is only available on Ethereum mainnet");
    if (getAddress(asset) !== getAddress(SOMMELIER_ASSETS[0])) throw new Error("Sommelier currently just supports WETH");

    const res: SommelierApyEntry[] = (await axios.get('https://api.sommelier.finance/dailyData/ethereum/0xfd6db5011b171B05E1Ea3b92f9EAcaEEb055e971/0/latest')).data.Response
    const latest = res.slice(0, 30)
    const apy = latest.map(l => l.daily_apy).reduce((a, b) => a + b, 0) / 30

    return {
      total: apy,
      apy: [{
        rewardToken: getAddress(asset),
        apy: apy
      }]
    };
  }

  getAssets(chainId: number): Promise<Address[]> {
    if (chainId !== 1) throw new Error("Sommelier is only available on Ethereum mainnet");

    return Promise.resolve(SOMMELIER_ASSETS.map(asset => getAddress(asset)))
  }
}