import { Address } from "viem";
import { curve } from "./curve";
import { ZERO } from "@/lib/constants";
import { StrategyDefaultResolverParams } from "..";

// @dev Make sure the addresses here are correct checksum addresses
const CRV: { [key: number]: Address } = { 1: "0xD533a949740bb3306d119CC777fa900bA034cd52" }

export async function curveCompounder({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
  const rewardTokens = [CRV[chainId]];
  const baseAsset: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
  const minTradeAmounts = [ZERO.toString()];
  const optionalData = ["0x"];

  const [gaugeId] = await curve({ chainId, client, address })

  return [gaugeId, rewardTokens, minTradeAmounts, baseAsset, optionalData]
}
