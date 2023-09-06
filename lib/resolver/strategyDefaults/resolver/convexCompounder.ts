import { constants } from "ethers";
import { convex } from "./convex";

const CRV = { 1: "0xD533a949740bb3306d119CC777fa900bA034cd52" }
const CVX = { 1: "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B" }

export async function convexCompounder({ chainId, address }: { chainId: number, address: string }): Promise<any[]> {
  // @ts-ignore
  const rewardTokens = [CRV[chainId], CVX[chainId]];
  const baseAsset = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
  const minTradeAmounts = [constants.Zero.toString(), constants.Zero.toString()];
  const optionalData = ["0x"];

  const [convexPoolId] = await convex({ chainId, address })

  return [convexPoolId, rewardTokens, minTradeAmounts, baseAsset, optionalData]
}