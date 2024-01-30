import { parseAbi } from "viem";

export const CTOKEN_ABI = parseAbi([
    "function supplyRatePerBlock() view returns (uint)",
]);