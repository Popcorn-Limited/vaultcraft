import { constants } from "ethers";
import { stargate } from "./stargate";

const STG_ADDRESS = { 1: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6" }
const STARGATE_ROUTER = { 1: "0x8731d54E9D02c286767d56ac03e8037C07e01e98" }

export async function curveStargateCompounder({ chainId, address }: { chainId: number, address: string }): Promise<any[]> {
  // @ts-ignore
  const rewardTokens = [STG_ADDRESS[chainId]];
  // @ts-ignore
  const optionalData = [STARGATE_ROUTER[chainId]];
  const baseAsset = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
  const minTradeAmounts = [constants.Zero.toString()];

  const [stgLpToken] = await stargate({ chainId, address })

  return [stgLpToken, rewardTokens, minTradeAmounts, baseAsset, optionalData]
}
