import {
  Address,
  PublicClient,
  getAddress,
  parseEther,
  zeroAddress,
} from "viem";
import axios from "axios";
import { Yield } from "vaultcraft-sdk";
import { getEmptyYield } from "vaultcraft-sdk/dist/yieldOptions/providers/protocols";
import { ERC20Abi } from "../constants";

const velo = "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db";

export async function getApy(
  chainId: number,
  asset: Address,
  client: PublicClient
): Promise<Yield> {
  if (chainId !== 10)
    throw new Error("Velodrome is only supported on Optimism");

  const gauge = await client.readContract({
    address: "0x41C914ee0c7E1A5edCD0295623e6dC557B5aBf3C",
    abi: voterAbi,
    functionName: "gauges",
    args: [asset],
  });

  if (gauge === zeroAddress) return getEmptyYield(asset);

  const token0 = await client.readContract({
    address: asset,
    abi: lpAbi,
    functionName: "token0",
  });
  const token1 = await client.readContract({
    address: asset,
    abi: lpAbi,
    functionName: "token1",
  });

  const decimals0 = await client.readContract({
    address: token0,
    abi: ERC20Abi,
    functionName: "decimals",
  });
  const decimals1 = await client.readContract({
    address: token1,
    abi: ERC20Abi,
    functionName: "decimals",
  });

  const bal0 = await client.readContract({
    address: asset,
    abi: lpAbi,
    functionName: "reserve0",
  });
  const bal1 = await client.readContract({
    address: asset,
    abi: lpAbi,
    functionName: "reserve1",
  });

  const { data: priceData } = await axios.get(
    `https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/coins/prices/current/optimism:${token0},optimism:${token1},optimism:${velo}`
  );

  const rewardRate = await client.readContract({
    address: gauge,
    abi: gaugeAbi,
    functionName: "rewardRate",
  });

  const totalRewards = (rewardRate * BigInt(31557600)) / parseEther("1");
  const rewardValue =
    Number(totalRewards) * priceData.coins[`optimism:${velo}`].price;

  const val0 =
    Number(bal0 / BigInt(10 ** decimals0)) *
    priceData.coins[`optimism:${token0}`].price;
  const val1 =
    Number(bal1 / BigInt(10 ** decimals1)) *
    priceData.coins[`optimism:${token1}`].price;
  const totalValue = val0 + val1;

  const apy = (rewardValue / totalValue) * 100;

  return {
    total: apy,
    apy: [
      {
        rewardToken: getAddress(asset),
        apy: apy,
      },
    ],
  };
}

export async function getAssets(
  chainId: number,
  client: PublicClient
): Promise<Address[]> {
  if (chainId !== 10)
    throw new Error("Velodrome is only supported on Optimism");

  const allPoolsLength = await client.readContract({
    address: "0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a",
    abi: poolFactoryAbi,
    functionName: "allPoolsLength",
  });

  const iterations = Math.ceil(Number(allPoolsLength) / 50);
  return (
    await Promise.all(
      new Array(iterations).fill(0).map(async (v, i) => {
        const pools = await client.readContract({
          address: "0xE180829A166d1e0bec705C1eB25758F645C9E317",
          abi: lpSugarAbi,
          functionName: "all",
          args: [BigInt(50), BigInt(i * 50), zeroAddress],
        });
        return pools.map((pool) => pool.lp);
      })
    )
  ).flat();
}

const poolFactoryAbi = [
  {
    inputs: [],
    name: "allPoolsLength",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const lpSugarAbi = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      { name: "_voter", type: "address" },
      { name: "_registry", type: "address" },
      { name: "_convertor", type: "address" },
      { name: "_router", type: "address" },
      { name: "_alm_registry", type: "address" },
    ],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "forSwaps",
    inputs: [
      { name: "_limit", type: "uint256" },
      { name: "_offset", type: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "lp", type: "address" },
          { name: "type", type: "int24" },
          { name: "token0", type: "address" },
          { name: "token1", type: "address" },
          { name: "factory", type: "address" },
          { name: "pool_fee", type: "uint256" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "tokens",
    inputs: [
      { name: "_limit", type: "uint256" },
      { name: "_offset", type: "uint256" },
      { name: "_account", type: "address" },
      { name: "_addresses", type: "address[]" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "token_address", type: "address" },
          { name: "symbol", type: "string" },
          { name: "decimals", type: "uint8" },
          { name: "account_balance", type: "uint256" },
          { name: "listed", type: "bool" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "all",
    inputs: [
      { name: "_limit", type: "uint256" },
      { name: "_offset", type: "uint256" },
      { name: "_account", type: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "lp", type: "address" },
          { name: "symbol", type: "string" },
          { name: "decimals", type: "uint8" },
          { name: "total_supply", type: "uint256" },
          { name: "nft", type: "address" },
          { name: "type", type: "int24" },
          { name: "tick", type: "int24" },
          { name: "price", type: "uint160" },
          { name: "token0", type: "address" },
          { name: "reserve0", type: "uint256" },
          { name: "token1", type: "address" },
          { name: "reserve1", type: "uint256" },
          { name: "gauge", type: "address" },
          { name: "gauge_total_supply", type: "uint256" },
          { name: "gauge_alive", type: "bool" },
          { name: "fee", type: "address" },
          { name: "bribe", type: "address" },
          { name: "factory", type: "address" },
          { name: "emissions", type: "uint256" },
          { name: "emissions_token", type: "address" },
          { name: "pool_fee", type: "uint256" },
          { name: "unstaked_fee", type: "uint256" },
          { name: "token0_fees", type: "uint256" },
          { name: "token1_fees", type: "uint256" },
          { name: "alm_vault", type: "address" },
          { name: "alm_reserve0", type: "uint256" },
          { name: "alm_reserve1", type: "uint256" },
          {
            name: "positions",
            type: "tuple[]",
            components: [
              { name: "id", type: "uint256" },
              { name: "manager", type: "address" },
              { name: "liquidity", type: "uint256" },
              { name: "staked", type: "uint256" },
              { name: "unstaked_earned0", type: "uint256" },
              { name: "unstaked_earned1", type: "uint256" },
              { name: "emissions_earned", type: "uint256" },
              { name: "tick_lower", type: "int24" },
              { name: "tick_upper", type: "int24" },
              { name: "alm", type: "bool" },
            ],
          },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "byIndex",
    inputs: [
      { name: "_index", type: "uint256" },
      { name: "_account", type: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "lp", type: "address" },
          { name: "symbol", type: "string" },
          { name: "decimals", type: "uint8" },
          { name: "total_supply", type: "uint256" },
          { name: "nft", type: "address" },
          { name: "type", type: "int24" },
          { name: "tick", type: "int24" },
          { name: "price", type: "uint160" },
          { name: "token0", type: "address" },
          { name: "reserve0", type: "uint256" },
          { name: "token1", type: "address" },
          { name: "reserve1", type: "uint256" },
          { name: "gauge", type: "address" },
          { name: "gauge_total_supply", type: "uint256" },
          { name: "gauge_alive", type: "bool" },
          { name: "fee", type: "address" },
          { name: "bribe", type: "address" },
          { name: "factory", type: "address" },
          { name: "emissions", type: "uint256" },
          { name: "emissions_token", type: "address" },
          { name: "pool_fee", type: "uint256" },
          { name: "unstaked_fee", type: "uint256" },
          { name: "token0_fees", type: "uint256" },
          { name: "token1_fees", type: "uint256" },
          { name: "alm_vault", type: "address" },
          { name: "alm_reserve0", type: "uint256" },
          { name: "alm_reserve1", type: "uint256" },
          {
            name: "positions",
            type: "tuple[]",
            components: [
              { name: "id", type: "uint256" },
              { name: "manager", type: "address" },
              { name: "liquidity", type: "uint256" },
              { name: "staked", type: "uint256" },
              { name: "unstaked_earned0", type: "uint256" },
              { name: "unstaked_earned1", type: "uint256" },
              { name: "emissions_earned", type: "uint256" },
              { name: "tick_lower", type: "int24" },
              { name: "tick_upper", type: "int24" },
              { name: "alm", type: "bool" },
            ],
          },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "epochsLatest",
    inputs: [
      { name: "_limit", type: "uint256" },
      { name: "_offset", type: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "ts", type: "uint256" },
          { name: "lp", type: "address" },
          { name: "votes", type: "uint256" },
          { name: "emissions", type: "uint256" },
          {
            name: "bribes",
            type: "tuple[]",
            components: [
              { name: "token", type: "address" },
              { name: "amount", type: "uint256" },
            ],
          },
          {
            name: "fees",
            type: "tuple[]",
            components: [
              { name: "token", type: "address" },
              { name: "amount", type: "uint256" },
            ],
          },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "epochsByAddress",
    inputs: [
      { name: "_limit", type: "uint256" },
      { name: "_offset", type: "uint256" },
      { name: "_address", type: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "ts", type: "uint256" },
          { name: "lp", type: "address" },
          { name: "votes", type: "uint256" },
          { name: "emissions", type: "uint256" },
          {
            name: "bribes",
            type: "tuple[]",
            components: [
              { name: "token", type: "address" },
              { name: "amount", type: "uint256" },
            ],
          },
          {
            name: "fees",
            type: "tuple[]",
            components: [
              { name: "token", type: "address" },
              { name: "amount", type: "uint256" },
            ],
          },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "rewards",
    inputs: [
      { name: "_limit", type: "uint256" },
      { name: "_offset", type: "uint256" },
      { name: "_venft_id", type: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "venft_id", type: "uint256" },
          { name: "lp", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "token", type: "address" },
          { name: "fee", type: "address" },
          { name: "bribe", type: "address" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "rewardsByAddress",
    inputs: [
      { name: "_venft_id", type: "uint256" },
      { name: "_pool", type: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "venft_id", type: "uint256" },
          { name: "lp", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "token", type: "address" },
          { name: "fee", type: "address" },
          { name: "bribe", type: "address" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "registry",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "voter",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "convertor",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "router",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "v1_factory",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "alm_registry",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

const voterAbi = [
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "gauges",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const gaugeAbi = [
  {
    inputs: [
      { internalType: "address", name: "_forwarder", type: "address" },
      { internalType: "address", name: "_stakingToken", type: "address" },
      { internalType: "address", name: "_feesVotingReward", type: "address" },
      { internalType: "address", name: "_rewardToken", type: "address" },
      { internalType: "address", name: "_voter", type: "address" },
      { internalType: "bool", name: "_isPool", type: "bool" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "NotAlive", type: "error" },
  { inputs: [], name: "NotAuthorized", type: "error" },
  { inputs: [], name: "NotVoter", type: "error" },
  { inputs: [], name: "RewardRateTooHigh", type: "error" },
  { inputs: [], name: "ZeroAmount", type: "error" },
  { inputs: [], name: "ZeroRewardRate", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "claimed0",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "claimed1",
        type: "uint256",
      },
    ],
    name: "ClaimFees",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ClaimRewards",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "NotifyReward",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "address", name: "_recipient", type: "address" },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_account", type: "address" }],
    name: "earned",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "fees0",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "fees1",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feesVotingReward",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_account", type: "address" }],
    name: "getReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "isPool",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "forwarder", type: "address" }],
    name: "isTrustedForwarder",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastTimeRewardApplicable",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastUpdateTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "left",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "notifyRewardAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "periodFinish",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardPerToken",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardPerTokenStored",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "rewardRateByEpoch",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "rewards",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stakingToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "userRewardPerTokenPaid",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "voter",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const lpAbi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  { inputs: [], name: "BelowMinimumK", type: "error" },
  { inputs: [], name: "DepositsNotEqual", type: "error" },
  { inputs: [], name: "FactoryAlreadySet", type: "error" },
  { inputs: [], name: "InsufficientInputAmount", type: "error" },
  { inputs: [], name: "InsufficientLiquidity", type: "error" },
  { inputs: [], name: "InsufficientLiquidityBurned", type: "error" },
  { inputs: [], name: "InsufficientLiquidityMinted", type: "error" },
  { inputs: [], name: "InsufficientOutputAmount", type: "error" },
  { inputs: [], name: "InvalidTo", type: "error" },
  { inputs: [], name: "IsPaused", type: "error" },
  { inputs: [], name: "K", type: "error" },
  { inputs: [], name: "NotEmergencyCouncil", type: "error" },
  {
    inputs: [{ internalType: "string", name: "str", type: "string" }],
    name: "StringTooLong",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    name: "Burn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    name: "Claim",
    type: "event",
  },
  { anonymous: false, inputs: [], name: "EIP712DomainChanged", type: "event" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    name: "Fees",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    name: "Mint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0In",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1In",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0Out",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1Out",
        type: "uint256",
      },
    ],
    name: "Swap",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "reserve0",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "reserve1",
        type: "uint256",
      },
    ],
    name: "Sync",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "blockTimestampLast",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "to", type: "address" }],
    name: "burn",
    outputs: [
      { internalType: "uint256", name: "amount0", type: "uint256" },
      { internalType: "uint256", name: "amount1", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimFees",
    outputs: [
      { internalType: "uint256", name: "claimed0", type: "uint256" },
      { internalType: "uint256", name: "claimed1", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "claimable0",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "claimable1",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentCumulativePrices",
    outputs: [
      { internalType: "uint256", name: "reserve0Cumulative", type: "uint256" },
      { internalType: "uint256", name: "reserve1Cumulative", type: "uint256" },
      { internalType: "uint256", name: "blockTimestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "eip712Domain",
    outputs: [
      { internalType: "bytes1", name: "fields", type: "bytes1" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "version", type: "string" },
      { internalType: "uint256", name: "chainId", type: "uint256" },
      { internalType: "address", name: "verifyingContract", type: "address" },
      { internalType: "bytes32", name: "salt", type: "bytes32" },
      { internalType: "uint256[]", name: "extensions", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "address", name: "tokenIn", type: "address" },
    ],
    name: "getAmountOut",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getReserves",
    outputs: [
      { internalType: "uint256", name: "_reserve0", type: "uint256" },
      { internalType: "uint256", name: "_reserve1", type: "uint256" },
      { internalType: "uint256", name: "_blockTimestampLast", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "index0",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "index1",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_token0", type: "address" },
      { internalType: "address", name: "_token1", type: "address" },
      { internalType: "bool", name: "_stable", type: "bool" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "lastObservation",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          {
            internalType: "uint256",
            name: "reserve0Cumulative",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserve1Cumulative",
            type: "uint256",
          },
        ],
        internalType: "struct Pool.Observation",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "metadata",
    outputs: [
      { internalType: "uint256", name: "dec0", type: "uint256" },
      { internalType: "uint256", name: "dec1", type: "uint256" },
      { internalType: "uint256", name: "r0", type: "uint256" },
      { internalType: "uint256", name: "r1", type: "uint256" },
      { internalType: "bool", name: "st", type: "bool" },
      { internalType: "address", name: "t0", type: "address" },
      { internalType: "address", name: "t1", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "to", type: "address" }],
    name: "mint",
    outputs: [{ internalType: "uint256", name: "liquidity", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "nonces",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "observationLength",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "observations",
    outputs: [
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "uint256", name: "reserve0Cumulative", type: "uint256" },
      { internalType: "uint256", name: "reserve1Cumulative", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "poolFees",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenIn", type: "address" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "points", type: "uint256" },
    ],
    name: "prices",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenIn", type: "address" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "granularity", type: "uint256" },
    ],
    name: "quote",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reserve0",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reserve0CumulativeLast",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reserve1",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reserve1CumulativeLast",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenIn", type: "address" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "points", type: "uint256" },
      { internalType: "uint256", name: "window", type: "uint256" },
    ],
    name: "sample",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "__name", type: "string" }],
    name: "setName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "__symbol", type: "string" }],
    name: "setSymbol",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "to", type: "address" }],
    name: "skim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stable",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "supplyIndex0",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "supplyIndex1",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amount0Out", type: "uint256" },
      { internalType: "uint256", name: "amount1Out", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "swap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "sync",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token0",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token1",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokens",
    outputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
