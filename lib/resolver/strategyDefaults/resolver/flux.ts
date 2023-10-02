import { ADDRESS_ZERO } from "@/lib/constants";
import { Address, mainnet } from "wagmi";
import { StrategyDefaultResolverParams } from "..";

// Flux is mainnet only.
// @dev Make sure the keys here are correct checksum addresses
const assetToCToken: { [key: Address]: Address } = {
  // DAI
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": "0xe2bA8693cE7474900A045757fe0efCa900F6530b",
  // USDC
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "0x465a5a630482f3abD6d3b84B39B29b07214d19e5",
  // USDT
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": "0x81994b9607e06ab3d5cF3AffF9a67374f05F27d7",
  // FRAX
  "0x853d955aCEf822Db058eb8505911ED77F175b99e": "0x1C9A2d6b33B4826757273D47ebEe0e2DddcD978B",
  // OUSDG
  "0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92": "0x1dD7950c266fB1be96180a8FDb0591F70200E018",
};

export async function flux({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
  return chainId === mainnet.id ? [assetToCToken[address] || ADDRESS_ZERO] : [ADDRESS_ZERO];
}