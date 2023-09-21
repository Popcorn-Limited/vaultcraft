

import { RPC_PROVIDERS } from "@/lib/connectors";
import { BigNumber, Contract } from "ethers";

const tranches = {
  "0x6b175474e89094c44da98b954eedeac495271d0f": {
    cdo: "0x5dca0b3ed7594a6613c1a2acd367d56e1f74f92d",
    junior: "0x38d36353d07cfb92650822d9c31fb4ada1c73d6e",
    senior: "0x43ed68703006add5f99ce36b5182392362369c1c"
  }, // dai clearpool portofino
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
    cdo: "0xe7c6a4525492395d65e736c3593ac933f33ee46e",
    junior: "0xbcc845bb731632ebe8ac0bfacde056170aaaaa06",
    senior: "0xdca1dae87f5c733c84e0593984967ed756579bee"
  }, // usdc clearpool fasanara
  "0xdac17f958d2ee523a2206206994597c13d831ec7": {
    cdo: "0xc4574C60a455655864aB80fa7638561A756C5E61",
    junior: "0x3Eb6318b8D9f362a0e1D99F6032eDB1C4c602500",
    senior: "0x0a6f2449c09769950cfb76f905ad11c341541f70"
  }, // usdt clearpool fasanara
  "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": {
    cdo: "0x8e0a8a5c1e5b3ac0670ea5a613bb15724d51fc37",
    junior: "0x990b3af34ddb502715e1070ce6778d8eb3c8ea82",
    senior: "0xdf17c739b666b259da3416d01f0310a6e429f592"
  }, // stEth instadapp
}

const apr2apy = (apr: BigNumber) => {
  return (1 + (Number(apr) / 1e20) / 365) ** 365 - 1;
}

async function idle({ chainId, address, key }: { chainId: number, address: string, key: string }): Promise<number> {
  if(address.toLowerCase() === "0xae7ab96520de3a18e5e111b5eaab095312d7fe84") return Infinity // stEth returns 0 on getAPR
  // @ts-ignore
  const idleAddresses = tranches[address];
  const cdo = new Contract(
    idleAddresses.cdo,
    ["function getApr(address) view returns (uint256)"],
    // @ts-ignore
    RPC_PROVIDERS[chainId]
  );
  const apr = await cdo.getApr(idleAddresses[key])

  return apr2apy(apr) * 100
};

export async function idleJunior({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  return idle({ chainId, address, key: "junior" })
}

export async function idleSenior({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  return idle({ chainId, address, key: "senior" })
}