export * from "./abi";
import assets from "@/lib/constants/assets";
import { Token } from "../types";
import { Address } from "viem";

export function getAssetsByChain(chainId: number): Token[] {
  return assets.filter((asset) => asset.chains.includes(chainId)).map((asset) => {
    return {
      address: asset.address[String(chainId)],
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
export const PopByChain: { [key: number]: Address } = {
  1: "0xd0cd466b34a24fcb2f87676278af2005ca8a78c4",
  137: "0xC5B57e9a1E7914FDA753A88f24E5703e617Ee50c",
  10: "0x6F0fecBC276de8fC69257065fE47C5a03d986394"
}
export const PopStakingByChain: { [key: number]: Address } = {
  1: "0xeEE1d31297B042820349B03027aB3b13a9406184",
  137: "0xe8af04AD759Ad790Aa5592f587D3cFB3ecC6A9dA",
  10: "0x3Fcc4eA703054453D8697b58C5CB2585F8883C05"
}

export const ADDRESS_ZERO: Address = "0x0000000000000000000000000000000000000000"
export const MAX_INT256 = BigInt(0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff)
export const MAX_UINT256 = BigInt(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff)
export const MINUS_ONE = BigInt(-0x01)
export const ZERO = BigInt(0)