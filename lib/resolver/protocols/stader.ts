import type { ProtocolName, Yield } from "src/yieldOptions/types.js";
import { Address, getAddress } from "viem";
import { IProtocol, getEmptyYield } from "./index.js";
import axios from "axios";


const STADER_ASSETS: { [key: number]: Address[] } = {
  1: [
    "0xBCe0Cf87F513102F22232436CCa2ca49e815C3aC", // Ethx
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
    "0x0000000000000000000000000000000000000000", // ETH
  ],
}

const assetToPoolId: { [key: string]: string } = {
  "0xBCe0Cf87F513102F22232436CCa2ca49e815C3aC": "90bfb3c2-5d35-4959-a275-ba5085b08aa3",
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": "90bfb3c2-5d35-4959-a275-ba5085b08aa3",
  "0x0000000000000000000000000000000000000000": "90bfb3c2-5d35-4959-a275-ba5085b08aa3",
}

export class Stader implements IProtocol {
  constructor() { }

  key(): ProtocolName {
    return "stader";
  }

  async getApy(chainId: number, asset: Address): Promise<Yield> {
    if (!Object.keys(STADER_ASSETS).includes(String(chainId))) throw new Error(`Missing public client for chain ID: ${chainId}`);

    const apyBase7d = (await axios.get(`https://yields.llama.fi/chart/${assetToPoolId[getAddress(asset)]}`)).data.data.pop().apyBase7d

    return apyBase7d ? {
      total: apyBase7d,
      apy: [{
        rewardToken: getAddress(asset),
        apy: apyBase7d
      }]
    } : getEmptyYield(asset);
  }

  getAssets(chainId: number): Promise<Address[]> {
    if (!Object.keys(STADER_ASSETS).includes(String(chainId))) throw new Error(`Missing public client for chain ID: ${chainId}`);

    return Promise.resolve(STADER_ASSETS[chainId].map(asset => getAddress(asset)))
  }
}