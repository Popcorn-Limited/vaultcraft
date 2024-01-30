import { parseAbi } from "viem";

export const LENDING_POOL_ABI = parseAbi([
    "function getReserveData(address asset) view returns (((uint256),uint128,uint128,uint128,uint128,uint128,uint40,address,address,address,address,uint8))",
    "function getReservesList() view returns (address[])",
]);