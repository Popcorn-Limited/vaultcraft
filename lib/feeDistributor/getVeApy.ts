import { Chain, createPublicClient, http } from "viem";
import { llama } from "@/lib/resolver/price/resolver";
import { thisPeriodTimestamp } from "@/lib/gauges/utils";
import { RPC_URLS } from "@/lib/utils/connectors";

interface ClaimableTokensArgs {
  chain: Chain;
  address: `0x${string}`;
  token: `0x${string}`;
}

export default async function getVeApy({
  chain,
  address,
  token,
}: ClaimableTokensArgs): Promise<number> {
  const popPriceUSD = await llama({
    address: "0x6F0fecBC276de8fC69257065fE47C5a03d986394",
    chainId: 10,
  });
  const wethPriceUSD = await llama({
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    chainId: 1,
  });
  const timestamp = BigInt(String(thisPeriodTimestamp() - 604800));

  const client = createPublicClient({
    chain,
    transport: http(RPC_URLS[chain.id]),
  });
  const data = await client.multicall({
    contracts: [
      {
        address,
        abi: abiFeeDistributor,
        functionName: "getTotalSupplyAtTimestamp",
        args: [timestamp],
      },
      {
        address,
        abi: abiFeeDistributor,
        functionName: "getTokensDistributedInWeek",
        args: [token, timestamp],
      },
    ],
    allowFailure: false,
  });

  if (Number(data[1]) > 0 && Number(data[0]) > 0) {
    const rewardValue = Number(data[1]) * wethPriceUSD;
    const supplyValue = Number(data[0]) * popPriceUSD;
    const apy = (rewardValue / supplyValue) * 52;
    return apy;
  }

  return 0;
}

const abiFeeDistributor = [
  {
    stateMutability: "view",
    type: "function",
    name: "getTokensDistributedInWeek",
    inputs: [
      {
        name: "token",
        type: "address",
      },
      {
        name: "timestamp",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getTotalSupplyAtTimestamp",
    inputs: [
      {
        name: "timestamp",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getUserBalanceAtTimestamp",
    inputs: [
      {
        name: "user",
        type: "address",
      },
      {
        name: "timestamp",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
] as const;
