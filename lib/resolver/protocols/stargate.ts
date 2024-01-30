import { Address, getAddress } from "viem";
import { LlamaPool, ProtocolName, Yield } from "src/yieldOptions/types.js";
import { Clients, IProtocol, getEmptyYield } from "./index.js";
import axios from "axios";
import NodeCache from "node-cache";
import { networkNames } from "@/lib/constants/index.js";

// @dev Make sure the keys here are correct checksum addresses
const STARGATE_LP_STAKING_ADDRESS: { [key: number]: Address } = { 1: "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b", 42161: "0xeA8DfEE1898a7e0a59f7527F076106d7e44c2176" }

// @dev Make sure the keys here are correct checksum addresses
const STG_ADDRESS: { [key: number]: Address } = { 1: "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6", 42161: "0x6694340fc020c5E6B96567843da2df01b2CE1eb6" }

export class Stargate implements IProtocol {
  private clients: Clients;
  private cache: NodeCache;

  constructor(clients: Clients, ttl: number) {
    this.clients = clients;
    this.cache = new NodeCache({ stdTTL: ttl });
  }

  key(): ProtocolName {
    return "stargate";
  }

  async getApy(chainId: number, asset: Address): Promise<Yield> {
    const client = this.clients[chainId];
    if (!client) throw new Error(`Missing public client for chain ID: ${chainId}`);

    const token = await client.readContract({
      address: asset,
      abi: sTokenAbi,
      functionName: "token"
    });

    let pools = this.cache.get("llama-pools") as LlamaPool[];
    if (!pools) {
      const res = (await axios.get("https://yields.llama.fi/pools")).data;
      pools = res.data;
      this.cache.set("llama-pools", pools);
    }

    const filteredPools: LlamaPool[] = pools.filter((pool: LlamaPool) => pool.chain === networkNames[chainId] && pool.project === "stargate")
    const pool = filteredPools.find(pool => getAddress(pool.underlyingTokens[0]) === getAddress(token))

    // TODO - Lps earn 1BPS on each transfer. Defillama has no data for this though so i currently dont know how to access that data.
    return pool ? {
      total: Number(pool.apy),
      apy: [{
        rewardToken: getAddress(STG_ADDRESS[chainId]),
        apy: Number(pool.apy),
      }],
    } : getEmptyYield(asset);
  }

  async getAssets(chainId: number): Promise<Address[]> {
    const client = this.clients[chainId];
    if (!client) throw new Error(`Missing public client for chain ID: ${chainId}`);

    const poolLength = await client.readContract({
      address: STARGATE_LP_STAKING_ADDRESS[chainId] as Address,
      abi: lpStakingAbi,
      functionName: "poolLength"
    });

    const tokens = await client.multicall({
      contracts: Array(Number(poolLength)).fill(undefined).map((item, idx) => {
        return {
          address: STARGATE_LP_STAKING_ADDRESS[chainId] as Address,
          abi: lpStakingAbi,
          functionName: "poolInfo",
          args: [idx]
        }
      })
    });

    return tokens.filter(token => token.status === "success").map((token: any) => getAddress(token.result[0])) as Address[];
  }
}

const lpStakingAbi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "poolInfo",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "lpToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allocPoint",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastRewardBlock",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "accStargatePerShare",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
] as const;

const sTokenAbi = [
  {
    "inputs": [],
    "name": "token",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;