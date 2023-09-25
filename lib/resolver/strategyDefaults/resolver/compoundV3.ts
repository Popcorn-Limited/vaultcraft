import { ADDRESS_ZERO } from "@/lib/constants";
import { Address } from "viem";
import { StrategyDefaultResolverParams } from "..";

// @dev Make sure the keys here are correct checksum addresses
const assetToCToken: { [key: number]: { [key: Address]: Address } } = {
  1: {
    // USDC
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
    // WETH
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "0xA17581A9E3356d9A858b789D68B4d866e593aE94",
  },
  137: {
    // USDC
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": "0xF25212E676D1F7F89Cd72fFEe66158f541246445"
  },
  42161: {
    // USDC Bridged
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8": "0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA",
    // USDC Native
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831": "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf",
  },
  8453: {
    // USDC Bridged
    "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA": "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf",
    // WETH
    "0x4200000000000000000000000000000000000006": "0x46e6b214b524310239732D51387075E0e70970bf"
  },
};

// @dev Make sure the keys here are correct checksum addresses
const COMET_REWARDER: { [key: number]: Address } = {
  1: "0x1B0e765F6224C21223AeA2af16c1C46E38885a40",
  137: "0x45939657d1CA34A8FA39A924B71D28Fe8431e581",
  42161: "0x88730d254A2f7e6AC8388c3198aFd694bA9f7fae",
  84553: "0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1"
}

export async function compoundV3({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
  if (Object.keys(assetToCToken).includes(String(chainId)) && Object.keys(assetToCToken[chainId]).includes(address)) {
    return [assetToCToken[chainId][address], COMET_REWARDER[chainId]];
  } else {
    return [ADDRESS_ZERO, ADDRESS_ZERO];
  }
}