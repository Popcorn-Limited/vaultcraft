// (
//   address baseAsset,
//   address vault,
//   BalancerRoute[] memory toBaseAssetRoutes,
//   BalancerRoute memory toAssetRoute,
//   uint256[] memory minTradeAmounts,
//   bytes memory optionalData
// )

import { RPC_PROVIDERS } from "@/lib/connectors";
import { Contract, constants, utils } from "ethers";

// struct BalancerRoute {
//   BatchSwapStep[] swaps;
//   IAsset[] assets;
//   int256[] limits;
// }

// struct BatchSwapStep {
//   bytes32 poolId;
//   uint256 assetInIndex;
//   uint256 assetOutIndex;
//   uint256 amount;
//   bytes userData;
// }

const BAL = { 1: "0xba100000625a3754423978a60c9317c58a424e3D" }
const AURA = { 1: "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF" }
const BALANCER_VAULT = { 1: "0xBA12222222228d8Ba445958a75a0704d566BF2C8" }

export async function balancerLpCompounder({ chainId, address, adapter }: { chainId: number, address: string, adapter: string }): Promise<any[]> {
  const balancerVault = new Contract(
    // @ts-ignore
    BALANCER_VAULT[chainId],
    ["function getPoolTokens(bytes32 poolId) view returns (address[] memory tokens,uint256[] memory balances,uint256 lastChangeBlock)"],
    // @ts-ignore 
    RPC_PROVIDERS[chainId])
  const pool = new Contract(
    address,
    ["function getPoolId() view returns (bytes32)"],
    // @ts-ignore 
    RPC_PROVIDERS[chainId])

  const poolId = await pool.getPoolId()

  const [tokens, ,] = await balancerVault.getPoolTokens(poolId)

  // @ts-ignore
  const rewardTokens = [BAL[chainId]];
  const baseAsset = [tokens[0]] // TODO - find a smarter algorithm to determine the base asset
  const minTradeAmounts = [constants.Zero.toString()];
  const optionalData = [poolId, 0];

  if (adapter === "AuraAdapter") {
    // @ts-ignore
    rewardTokens.push(AURA[chainId]);
    minTradeAmounts.push(constants.Zero.toString());
  }

  return [rewardTokens, minTradeAmounts, baseAsset, optionalData]
}
