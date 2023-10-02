import { Address } from "viem";
import { convex } from "./convex";
import { ZERO } from "@/lib/constants";
import { StrategyDefaultResolverParams } from "..";

// @dev Make sure the addresses here are correct checksum addresses
const CRV: { [key: number]: Address } = { 1: "0xD533a949740bb3306d119CC777fa900bA034cd52" }
const CVX: { [key: number]: Address } = { 1: "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B" }

export async function convexCompounder({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
  const rewardTokens = [CRV[chainId], CVX[chainId]];
  const baseAsset: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
  const minTradeAmounts = [ZERO.toString(), ZERO.toString()];
  const optionalData = ["0x"];

  const [convexPoolId] = await convex({ chainId, client, address })

  return [convexPoolId, rewardTokens, minTradeAmounts, baseAsset, optionalData]
}
