import { constants } from "ethers";
import { mainnet } from "wagmi";

// @dev dont forget to lowercase the keys when you add a new one
const AVAILABLE_ASSETS = [
  "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
  "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", // stETH
  "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"  // Matic
]

export async function idle({ chainId }: { chainId: number }): Promise<string[]> {
  return chainId === mainnet.id ? AVAILABLE_ASSETS : [constants.AddressZero];
}