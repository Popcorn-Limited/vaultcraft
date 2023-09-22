import { RPC_URLS } from "@/lib/connectors";
import { balancer } from "./balancer";
import { Address, createPublicClient, http } from "viem";
import { ZERO } from "@/lib/constants";
import { mainnet } from "wagmi";

// @dev Make sure the addresses here are correct checksum addresses
const BAL: { [key: number]: Address } = { 1: "0xba100000625a3754423978a60c9317c58a424e3D" }
const BALANCER_VAULT: { [key: number]: Address } = { 1: "0xBA12222222228d8Ba445958a75a0704d566BF2C8" }

export async function balancerLpCompounder({ chainId, address }: { chainId: number, address: Address }): Promise<any[]> {
  // TODO -- temp solution, we should pass the client into the function
  const client = createPublicClient({
    chain: mainnet,
    // @ts-ignore
    transport: http(RPC_URLS[chainId])
  })

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

  const rewardTokens = [BAL[chainId]];
  const baseAsset = poolTokens[0][0] // TODO - find a smarter algorithm to determine the base asset
  const minTradeAmounts = [ZERO.toString()];
  const optionalData = [poolId, 0];

  const [gaugeAddress] = await balancer({ chainId, address })

  return [gaugeAddress, rewardTokens, minTradeAmounts, baseAsset, optionalData]
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