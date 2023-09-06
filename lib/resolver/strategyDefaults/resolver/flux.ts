import { constants } from "ethers";
import { mainnet } from "wagmi";

// @dev dont forget to lowercase the keys when you add a new one
const CTOKENS: { [key: string]: string } = {
  "0x6b175474e89094c44da98b954eedeac495271d0f": "0xe2bA8693cE7474900A045757fe0efCa900F6530b", // DAI
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "0x465a5a630482f3abD6d3b84B39B29b07214d19e5", // USDC
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "0x81994b9607e06ab3d5cF3AffF9a67374f05F27d7", // USDT
  "0x853d955acef822db058eb8505911ed77f175b99e": "0x1C9A2d6b33B4826757273D47ebEe0e2DddcD978B"  // FRAX
}

export async function flux({ chainId, address }: { chainId: number, address: string }): Promise<any[]> {
  return chainId === mainnet.id ? [(CTOKENS[address.toLowerCase()] || constants.AddressZero)] : [constants.AddressZero];
}