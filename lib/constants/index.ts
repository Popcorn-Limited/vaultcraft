export * from "./abi";
import assets from "@/lib/constants/assets";
import { Token } from "../types";
import { Address, getAddress, maxInt256, maxUint256, zeroAddress } from "viem";

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

export const VaultRegistryByChain: { [key: number]: Address } = {
  1: "0x007318Dc89B314b47609C684260CfbfbcD412864",
  137: "0x2246c4c469735bCE95C120939b0C078EC37A08D0",
  10: "0xdD0d135b5b52B7EDd90a83d4A4112C55a1A6D23A",
  42161: "0xB205e94D402742B919E851892f7d515592a7A6cC",
}

export const ADDRESS_ZERO = zeroAddress
export const MAX_INT256 = maxInt256
export const MAX_UINT256 = maxUint256
export const MINUS_ONE = BigInt(-0x01)
export const ZERO = BigInt(0)
export const EMPTY_BYTES = "0x"
export const ROUNDING_VALUE = 10_000;
export const VCX_POOL_ID = "0x577a7f7ee659aa14dc16fd384b3f8078e23f1920000200000000000000000633"