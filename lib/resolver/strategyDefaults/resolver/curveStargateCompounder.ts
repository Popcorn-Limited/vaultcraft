import { Address } from "viem";
import { stargate } from "./stargate";
import { ZERO } from "@/lib/constants";
import { StrategyDefaultResolverParams } from "..";

const STG_ADDRESS: { [key: number]: Address } = { 1: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6" }
const STARGATE_ROUTER: { [key: number]: Address } = { 1: "0x8731d54E9D02c286767d56ac03e8037C07e01e98" }

export async function curveStargateCompounder({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
  const rewardTokens = [STG_ADDRESS[chainId]];
  const optionalData = [STARGATE_ROUTER[chainId]];
  const baseAsset: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
  const minTradeAmounts = [ZERO.toString()];

  const [stgLpToken] = await stargate({ chainId, client, address })

  return [stgLpToken, rewardTokens, minTradeAmounts, baseAsset, optionalData]
}
