import { maxInt256, maxUint256, zeroAddress } from "viem";

export * from "./addresses"
export * from "./abi";

export const ADDRESS_ZERO = zeroAddress;
export const ALT_NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const MAX_INT256 = maxInt256;
export const MAX_UINT256 = maxUint256;
export const MINUS_ONE = BigInt(-0x01);
export const ZERO = BigInt(0);
export const EMPTY_BYTES = "0x";
export const ROUNDING_VALUE = 10_000;
export const VCX_POOL_ID =
  "0x577a7f7ee659aa14dc16fd384b3f8078e23f1920000200000000000000000633";
export const SECONDS_PER_YEAR = 31536000;

export const DEBANK_CHAIN_IDS: { [key: number]: string } = {
  [1]: `eth`,
  [10]: `op`,
  [42161]: `arb`,
  [137]: `matic`,
  [56]: `bsc`,
  [196]: `xlayer`,
  [8453]: `base`,
  [252]: `frax`,
  [43114]: `avax`
}

export const ORACLES_DEPLOY_BLOCK: { [key: number]: number } = {
  [1]: 0,
  [10]: 0,
  [42161]: 0,
  [137]: 0,
  [56]: 48150138,
  [196]: 0,
  [8453]: 22963828,
  [252]: 0,
  [43114]: 53621065,
  [43111]: 1383914,
  [2818]: 10437632
}