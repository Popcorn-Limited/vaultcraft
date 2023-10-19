import { ADDRESS_ZERO } from "@/lib/constants";
import { Address, mainnet } from "wagmi";
import { StrategyDefaultResolverParams } from "..";

// @dev Make sure the keys here are correct checksum addresses
const assetToCdo: { [key: Address]: Address } = {
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": "0x5dcA0B3Ed7594A6613c1A2acd367d56E1f74F92D", // dai clearpool portofino
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "0xE7C6A4525492395d65e736C3593aC933F33ee46e", // usdc clearpool fasanara
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": "0xc4574C60a455655864aB80fa7638561A756C5E61", // usdt clearpool fasanara
  "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84": "0x34dCd573C5dE4672C8248cd12A99f875Ca112Ad8", // stEth instadapp
}

export async function idle({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
  return chainId === mainnet.id ? [(assetToCdo[address] || ADDRESS_ZERO)] : [ADDRESS_ZERO];
}