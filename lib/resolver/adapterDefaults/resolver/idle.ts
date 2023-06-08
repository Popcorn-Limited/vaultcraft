import { constants } from "ethers";
import { mainnet } from "wagmi";

// @dev dont forget to lowercase the keys when you add a new one
const CDO: { [key: string]: string } = {
  "0x6b175474e89094c44da98b954eedeac495271d0f": "0x5dcA0B3Ed7594A6613c1A2acd367d56E1f74F92D", // DAI
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "0x1329E8DB9Ed7a44726572D44729427F132Fa290D", // USDC
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "0xc4574C60a455655864aB80fa7638561A756C5E61", // USDT
  "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": "0x34dCd573C5dE4672C8248cd12A99f875Ca112Ad8", // stETH
  "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0": "0xF87ec7e1Ee467d7d78862089B92dd40497cBa5B8"  // Matic
}

export async function idle({ chainId, address }: { chainId: number, address: string }): Promise<any[]> {
  return chainId === mainnet.id ? [(CDO[address.toLowerCase()] || constants.AddressZero)] : [constants.AddressZero];
}