
import { Address } from "viem";
import { aura } from "./aura";
import { ZERO } from "@/lib/constants";
import { StrategyDefaultResolverParams } from "..";

// @dev Make sure the addresses here are correct checksum addresses
const BAL: { [key: number]: Address } = { 1: "0xba100000625a3754423978a60c9317c58a424e3D" }
const AURA: { [key: number]: Address } = { 1: "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF" }
const BALANCER_VAULT: { [key: number]: Address } = { 1: "0xBA12222222228d8Ba445958a75a0704d566BF2C8" }

export async function auraCompounder({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
  const poolId = await client.readContract({
    address: address,
    abi: poolAbi,
    functionName: "getPoolId"
  })

  const poolTokens = await client.readContract({
    address: BALANCER_VAULT[chainId],
    abi: balancerVaultAbi,
    functionName: "getPoolTokens",
    args: [poolId]
  })

  const rewardTokens = [BAL[chainId], AURA[chainId]];
  const baseAsset = poolTokens[0][0] // TODO - find a smarter algorithm to determine the base asset
  const minTradeAmounts = [ZERO.toString(), ZERO.toString()];
  const optionalData = [poolId, 0];

  const [auraPoolId] = await aura({ chainId, client, address })

  return [auraPoolId, rewardTokens, minTradeAmounts, baseAsset, optionalData]
}


const poolAbi = [
  {
    "inputs": [],
    "name": "getPoolId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }] as const

const balancerVaultAbi = [{
  "inputs": [
    {
      "internalType": "bytes32",
      "name": "poolId",
      "type": "bytes32"
    }
  ],
  "name": "getPoolTokens",
  "outputs": [
    {
      "internalType": "contract IERC20[]",
      "name": "tokens",
      "type": "address[]"
    },
    {
      "internalType": "uint256[]",
      "name": "balances",
      "type": "uint256[]"
    },
    {
      "internalType": "uint256",
      "name": "lastChangeBlock",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}] as const