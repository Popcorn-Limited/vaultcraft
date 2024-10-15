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