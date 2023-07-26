

import { RPC_PROVIDERS } from "@/lib/connectors";
import { BigNumber, Contract } from "ethers";

const tranches = {
  "0x6b175474e89094c44da98b954eedeac495271d0f": { cdo: "0x5dca0b3ed7594a6613c1a2acd367d56e1f74f92d", tranch: "0x38d36353d07cfb92650822d9c31fb4ada1c73d6e" }, // dai junior
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": { cdo: "0x1329E8DB9Ed7a44726572D44729427F132Fa290D", tranch: "0xf85Fd280B301c0A6232d515001dA8B6c8503D714" }, // usdc junior
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { cdo: "0xc4574C60a455655864aB80fa7638561A756C5E61", tranch: "0x3Eb6318b8D9f362a0e1D99F6032eDB1C4c602500" }, // usdt junior
}

const apr2apy = (apr: BigNumber) => {
  return (1 + (Number(apr) / 1e20) / 365) ** 365 - 1;
}

export async function idle({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  // @ts-ignore
  const idleAddresses = tranches[address];
  if (idleAddresses === undefined) return 0
  
  const cdo = new Contract(
    idleAddresses.cdo,
    ["function getApr(address) view returns (uint256)"],
    // @ts-ignore
    RPC_PROVIDERS[chainId]
  );
  const apr = await cdo.getApr(idleAddresses.tranch)

  return apr2apy(apr) * 100
};
