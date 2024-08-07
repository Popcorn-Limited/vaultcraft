import { Address, getAddress } from "viem";
import { StrategyDefaultResolverParams } from "..";
import { AddressByChain } from "@/lib/types";


const CurveControllerByChain: AddressByChain = { 1: "0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB" }

// These are multi-chain gauges. These gauges dont have lpTokens on mainnet
// @dev unfortunately some multichain gauges are of type 0 so we still need to filter later
const GaugeTypesToSkip = [1, 2, 4, 7, 8, 9, 10, 11];

export async function curve({
  chainId,
  client,
  address,
}: StrategyDefaultResolverParams): Promise<any[]> {
  const poolLength = await client.readContract({
    address: CurveControllerByChain[chainId],
    abi: controllerAbi,
    functionName: "n_gauges",
  });

  const gauges = (await client.multicall({
    contracts: Array(Number(poolLength))
      .fill(undefined)
      .map((item, idx) => {
        return {
          address: CurveControllerByChain[chainId],
          abi: controllerAbi,
          functionName: "gauges",
          args: [idx],
        };
      }),
    allowFailure: false,
  })) as Address[];

  const gaugesWithId = gauges.map((gauge: any, idx: number) => {
    return { gauge: getAddress(gauge), id: idx };
  });

  const gaugeTypes = (await client.multicall({
    contracts: gaugesWithId.map((gauge, idx) => {
      return {
        address: CurveControllerByChain[chainId],
        abi: controllerAbi,
        functionName: "gauge_types",
        args: [gauge.gauge],
      };
    }),
    allowFailure: false,
  })) as BigInt[];
  const gaugesWithIdAndType = gaugesWithId.map((gauge, idx) => {
    return { ...gauge, type: Number(gaugeTypes[idx]) };
  });

  const filtered = gaugesWithIdAndType.filter(
    (gauge) => !GaugeTypesToSkip.includes(gauge.type)
  );

  // @ts-ignore
  const lpToken = await client.multicall({
    contracts: filtered.map((gauge, idx) => {
      return {
        address: gauge.gauge,
        abi: gaugeAbi,
        functionName: "lp_token",
      };
    }),
  });
  const filteredWithLp = filtered.map((gauge, idx) => {
    return {
      ...gauge,
      lp:
        lpToken[idx].status === "success"
          ? getAddress(lpToken[idx].result as string)
          : null,
      success: lpToken[idx].status === "success",
    };
  });
  const successFiltered = filteredWithLp.filter((gauge) => gauge.success);

  const result = successFiltered.find(
    (gauge) => gauge.lp === getAddress(address)
  );
  return [result !== undefined ? result.id : 0]; // TODO this should be a number we can clearly distinguish as wrong --> maybe undefined?
}

const controllerAbi = [
  {
    name: "CommitOwnership",
    inputs: [{ type: "address", name: "admin", indexed: false }],
    anonymous: false,
    type: "event",
  },
  {
    name: "ApplyOwnership",
    inputs: [{ type: "address", name: "admin", indexed: false }],
    anonymous: false,
    type: "event",
  },
  {
    name: "AddType",
    inputs: [
      { type: "string", name: "name", indexed: false },
      { type: "int128", name: "type_id", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "NewTypeWeight",
    inputs: [
      { type: "int128", name: "type_id", indexed: false },
      { type: "uint256", name: "time", indexed: false },
      { type: "uint256", name: "weight", indexed: false },
      { type: "uint256", name: "total_weight", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "NewGaugeWeight",
    inputs: [
      { type: "address", name: "gauge_address", indexed: false },
      { type: "uint256", name: "time", indexed: false },
      { type: "uint256", name: "weight", indexed: false },
      { type: "uint256", name: "total_weight", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "VoteForGauge",
    inputs: [
      { type: "uint256", name: "time", indexed: false },
      { type: "address", name: "user", indexed: false },
      { type: "address", name: "gauge_addr", indexed: false },
      { type: "uint256", name: "weight", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "NewGauge",
    inputs: [
      { type: "address", name: "addr", indexed: false },
      { type: "int128", name: "gauge_type", indexed: false },
      { type: "uint256", name: "weight", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    outputs: [],
    inputs: [
      { type: "address", name: "_token" },
      { type: "address", name: "_voting_escrow" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    name: "commit_transfer_ownership",
    outputs: [],
    inputs: [{ type: "address", name: "addr" }],
    stateMutability: "nonpayable",
    type: "function",
    gas: 37597,
  },
  {
    name: "apply_transfer_ownership",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 38497,
  },
  {
    name: "gauge_types",
    outputs: [{ type: "int128", name: "" }],
    inputs: [{ type: "address", name: "_addr" }],
    stateMutability: "view",
    type: "function",
    gas: 1625,
  },
  {
    name: "add_gauge",
    outputs: [],
    inputs: [
      { type: "address", name: "addr" },
      { type: "int128", name: "gauge_type" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "add_gauge",
    outputs: [],
    inputs: [
      { type: "address", name: "addr" },
      { type: "int128", name: "gauge_type" },
      { type: "uint256", name: "weight" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "checkpoint",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 18033784416,
  },
  {
    name: "checkpoint_gauge",
    outputs: [],
    inputs: [{ type: "address", name: "addr" }],
    stateMutability: "nonpayable",
    type: "function",
    gas: 18087678795,
  },
  {
    name: "gauge_relative_weight",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "address", name: "addr" }],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "gauge_relative_weight",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "address", name: "addr" },
      { type: "uint256", name: "time" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "gauge_relative_weight_write",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "address", name: "addr" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "gauge_relative_weight_write",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "address", name: "addr" },
      { type: "uint256", name: "time" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "add_type",
    outputs: [],
    inputs: [{ type: "string", name: "_name" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "add_type",
    outputs: [],
    inputs: [
      { type: "string", name: "_name" },
      { type: "uint256", name: "weight" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "change_type_weight",
    outputs: [],
    inputs: [
      { type: "int128", name: "type_id" },
      { type: "uint256", name: "weight" },
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 36246310050,
  },
  {
    name: "change_gauge_weight",
    outputs: [],
    inputs: [
      { type: "address", name: "addr" },
      { type: "uint256", name: "weight" },
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 36354170809,
  },
  {
    name: "vote_for_gauge_weights",
    outputs: [],
    inputs: [
      { type: "address", name: "_gauge_addr" },
      { type: "uint256", name: "_user_weight" },
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 18142052127,
  },
  {
    name: "get_gauge_weight",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "address", name: "addr" }],
    stateMutability: "view",
    type: "function",
    gas: 2974,
  },
  {
    name: "get_type_weight",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "int128", name: "type_id" }],
    stateMutability: "view",
    type: "function",
    gas: 2977,
  },
  {
    name: "get_total_weight",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 2693,
  },
  {
    name: "get_weights_sum_per_type",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "int128", name: "type_id" }],
    stateMutability: "view",
    type: "function",
    gas: 3109,
  },
  {
    name: "admin",
    outputs: [{ type: "address", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 1841,
  },
  {
    name: "future_admin",
    outputs: [{ type: "address", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 1871,
  },
  {
    name: "token",
    outputs: [{ type: "address", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 1901,
  },
  {
    name: "voting_escrow",
    outputs: [{ type: "address", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 1931,
  },
  {
    name: "n_gauge_types",
    outputs: [{ type: "int128", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 1961,
  },
  {
    name: "n_gauges",
    outputs: [{ type: "int128", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 1991,
  },
  {
    name: "gauge_type_names",
    outputs: [{ type: "string", name: "" }],
    inputs: [{ type: "int128", name: "arg0" }],
    stateMutability: "view",
    type: "function",
    gas: 8628,
  },
  {
    name: "gauges",
    outputs: [{ type: "address", name: "" }],
    inputs: [{ type: "uint256", name: "arg0" }],
    stateMutability: "view",
    type: "function",
    gas: 2160,
  },
  {
    name: "vote_user_slopes",
    outputs: [
      { type: "uint256", name: "slope" },
      { type: "uint256", name: "power" },
      { type: "uint256", name: "end" },
    ],
    inputs: [
      { type: "address", name: "arg0" },
      { type: "address", name: "arg1" },
    ],
    stateMutability: "view",
    type: "function",
    gas: 5020,
  },
  {
    name: "vote_user_power",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "address", name: "arg0" }],
    stateMutability: "view",
    type: "function",
    gas: 2265,
  },
  {
    name: "last_user_vote",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "address", name: "arg0" },
      { type: "address", name: "arg1" },
    ],
    stateMutability: "view",
    type: "function",
    gas: 2449,
  },
  {
    name: "points_weight",
    outputs: [
      { type: "uint256", name: "bias" },
      { type: "uint256", name: "slope" },
    ],
    inputs: [
      { type: "address", name: "arg0" },
      { type: "uint256", name: "arg1" },
    ],
    stateMutability: "view",
    type: "function",
    gas: 3859,
  },
  {
    name: "time_weight",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "address", name: "arg0" }],
    stateMutability: "view",
    type: "function",
    gas: 2355,
  },
  {
    name: "points_sum",
    outputs: [
      { type: "uint256", name: "bias" },
      { type: "uint256", name: "slope" },
    ],
    inputs: [
      { type: "int128", name: "arg0" },
      { type: "uint256", name: "arg1" },
    ],
    stateMutability: "view",
    type: "function",
    gas: 3970,
  },
  {
    name: "time_sum",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "uint256", name: "arg0" }],
    stateMutability: "view",
    type: "function",
    gas: 2370,
  },
  {
    name: "points_total",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "uint256", name: "arg0" }],
    stateMutability: "view",
    type: "function",
    gas: 2406,
  },
  {
    name: "time_total",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 2321,
  },
  {
    name: "points_type_weight",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "int128", name: "arg0" },
      { type: "uint256", name: "arg1" },
    ],
    stateMutability: "view",
    type: "function",
    gas: 2671,
  },
  {
    name: "time_type_weight",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "uint256", name: "arg0" }],
    stateMutability: "view",
    type: "function",
    gas: 2490,
  },
] as const;

const gaugeAbi = [
  {
    name: "Deposit",
    inputs: [
      { name: "provider", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "Withdraw",
    inputs: [
      { name: "provider", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "UpdateLiquidityLimit",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "original_balance", type: "uint256", indexed: false },
      { name: "original_supply", type: "uint256", indexed: false },
      { name: "working_balance", type: "uint256", indexed: false },
      { name: "working_supply", type: "uint256", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "CommitOwnership",
    inputs: [{ name: "admin", type: "address", indexed: false }],
    anonymous: false,
    type: "event",
  },
  {
    name: "ApplyOwnership",
    inputs: [{ name: "admin", type: "address", indexed: false }],
    anonymous: false,
    type: "event",
  },
  {
    name: "Transfer",
    inputs: [
      { name: "_from", type: "address", indexed: true },
      { name: "_to", type: "address", indexed: true },
      { name: "_value", type: "uint256", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "Approval",
    inputs: [
      { name: "_owner", type: "address", indexed: true },
      { name: "_spender", type: "address", indexed: true },
      { name: "_value", type: "uint256", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [{ name: "_lp_token", type: "address" }],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "deposit",
    inputs: [{ name: "_value", type: "uint256" }],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "deposit",
    inputs: [
      { name: "_value", type: "uint256" },
      { name: "_addr", type: "address" },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "deposit",
    inputs: [
      { name: "_value", type: "uint256" },
      { name: "_addr", type: "address" },
      { name: "_claim_rewards", type: "bool" },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "withdraw",
    inputs: [{ name: "_value", type: "uint256" }],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "_value", type: "uint256" },
      { name: "_claim_rewards", type: "bool" },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "claim_rewards",
    inputs: [],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "claim_rewards",
    inputs: [{ name: "_addr", type: "address" }],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "claim_rewards",
    inputs: [
      { name: "_addr", type: "address" },
      { name: "_receiver", type: "address" },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "transfer",
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "approve",
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "permit",
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
      { name: "_deadline", type: "uint256" },
      { name: "_v", type: "uint8" },
      { name: "_r", type: "bytes32" },
      { name: "_s", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "increaseAllowance",
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_added_value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "decreaseAllowance",
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_subtracted_value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "user_checkpoint",
    inputs: [{ name: "addr", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "set_rewards_receiver",
    inputs: [{ name: "_receiver", type: "address" }],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "kick",
    inputs: [{ name: "addr", type: "address" }],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "deposit_reward_token",
    inputs: [
      { name: "_reward_token", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "add_reward",
    inputs: [
      { name: "_reward_token", type: "address" },
      { name: "_distributor", type: "address" },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "set_reward_distributor",
    inputs: [
      { name: "_reward_token", type: "address" },
      { name: "_distributor", type: "address" },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "set_killed",
    inputs: [{ name: "_is_killed", type: "bool" }],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "claimed_reward",
    inputs: [
      { name: "_addr", type: "address" },
      { name: "_token", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "claimable_reward",
    inputs: [
      { name: "_user", type: "address" },
      { name: "_reward_token", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "claimable_tokens",
    inputs: [{ name: "addr", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "integrate_checkpoint",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "future_epoch_time",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "inflation_rate",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "DOMAIN_SEPARATOR",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "salt",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "arg0", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "allowance",
    inputs: [
      { name: "arg0", type: "address" },
      { name: "arg1", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "nonces",
    inputs: [{ name: "arg0", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "factory",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "lp_token",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "is_killed",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "reward_count",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "reward_data",
    inputs: [{ name: "arg0", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "token", type: "address" },
          { name: "distributor", type: "address" },
          { name: "period_finish", type: "uint256" },
          { name: "rate", type: "uint256" },
          { name: "last_update", type: "uint256" },
          { name: "integral", type: "uint256" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "rewards_receiver",
    inputs: [{ name: "arg0", type: "address" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "reward_integral_for",
    inputs: [
      { name: "arg0", type: "address" },
      { name: "arg1", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "working_balances",
    inputs: [{ name: "arg0", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "working_supply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "integrate_inv_supply_of",
    inputs: [{ name: "arg0", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "integrate_checkpoint_of",
    inputs: [{ name: "arg0", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "integrate_fraction",
    inputs: [{ name: "arg0", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "period",
    inputs: [],
    outputs: [{ name: "", type: "int128" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "reward_tokens",
    inputs: [{ name: "arg0", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "period_timestamp",
    inputs: [{ name: "arg0", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "integrate_inv_supply",
    inputs: [{ name: "arg0", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
