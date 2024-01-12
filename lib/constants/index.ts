export * from "./abi";
export * from "./addresses";
import assets from "@/lib/constants/assets";
import { Token } from "../types";
import { getAddress, maxInt256, maxUint256, zeroAddress } from "viem";

export function getAssetsByChain(chainId: number): Token[] {
  return assets.filter((asset) => asset.chains.includes(chainId)).map((asset) => {
    return {
      address: getAddress(asset.address[String(chainId)]),
      name: asset.name,
      symbol: asset.symbol,
      decimals: asset.decimals,
      logoURI: asset.logoURI,
      balance: 0,
      price: 0
    }
  });
}

export const ADDRESS_ZERO = zeroAddress
export const MAX_INT256 = maxInt256
export const MAX_UINT256 = maxUint256
export const MINUS_ONE = BigInt(-0x01)
export const ZERO = BigInt(0)
export const EMPTY_BYTES = "0x"
export const ROUNDING_VALUE = 10_000;
export const VCX_POOL_ID = "0x577a7f7ee659aa14dc16fd384b3f8078e23f1920000200000000000000000633"