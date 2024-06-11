import { NextApiRequest, NextApiResponse } from "next";
import { Address, PublicClient, createPublicClient, getAddress, http } from "viem";
import { ChainById, RPC_URLS, networkMap } from "@/lib/utils/connectors";
import { ERC20Abi, GaugeAbi, GaugeControllerAbi, VCX, VaultAbi } from "@/lib/constants";
import { vcx as getVcxPrice } from "@/lib/resolver/price/resolver";
import { mainnet } from "wagmi";
import axios from "axios";

const HIDDEN_GAUGES = [
  "0x38098e3600665168eBE4d827D24D0416efC24799", // Deployment script ran out of gas and somehow added a random address into the gauges which now breaks these calls
  "0xF4c8736c1cf9b03ccB09DA6e8A8312E75CA5B529", // Failed Op Gauge Test
];

const GaugeControllerAddress = "0xD57d8EEC36F0Ba7D8Fd693B9D97e02D8353EB1F4";

const clientByChainId: { [id: number]: PublicClient } = {
  1: createPublicClient({
    chain: ChainById[1],
    transport: http(RPC_URLS[1]),
  }),
  10: createPublicClient({
    chain: ChainById[10],
    transport: http(RPC_URLS[10]),
  }),
  42161: createPublicClient({
    chain: ChainById[42161],
    transport: http(RPC_URLS[421611]),
  }),
};

const gaugeTypeToChainId: { [id: number]: number } = {
  0: 1,
  1: 1,
  2: 1,
  3: 10,
  4: 42161,
};

const CHILD_GAUGE_TYPES: number[] = [3, 4];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const nGauges = await clientByChainId[1].readContract({
    address: GaugeControllerAddress,
    abi: GaugeControllerAbi,
    functionName: "n_gauges",
  });

  let gauges = await clientByChainId[1].multicall({
    contracts: Array(Number(nGauges))
      .fill(undefined)
      .map((item, idx) => {
        return {
          address: GaugeControllerAddress,
          abi: GaugeControllerAbi,
          functionName: "gauges",
          args: [idx],
        };
      }),
    allowFailure: false,
  }) as Address[];

  gauges = gauges.filter((gauge) => !HIDDEN_GAUGES.includes(gauge));

  const areGaugesKilled = await clientByChainId[1].multicall({
    contracts: gauges.map((gauge) => {
      return {
        address: gauge,
        abi: GaugeAbi,
        functionName: "is_killed",
      };
    }),
    allowFailure: false,
  });

  gauges = gauges?.filter((gauge, idx) => !areGaugesKilled[idx]);

  const gaugeTypes = await clientByChainId[1].multicall({
    contracts: gauges.map((address) => {
      return {
        address: GaugeControllerAddress,
        abi: GaugeControllerAbi,
        functionName: "gauge_types",
        args: [address],
      };
    }),
    allowFailure: false,
  });

  const vcxPriceInUsd = await getVcxPrice({ address: VCX, chainId: mainnet.id, client: undefined });

  const finalGaugeData: {
    [key: Address]:
    {
      address: Address;
      vault: Address;
      lowerAPR: number;
      upperAPR: number;
      rewardApy: number;
      minGaugeApy: number;
      maxGaugeApy: number;
    }
  } = {};

  await Promise.all(
    gauges.map(async (gauge, i) => {
      const gaugeType = Number(gaugeTypes[i]);
      const gaugeData = await getGaugeData(gauge, gaugeType);

      const vaultAssetPriceInUsd = await getVaultAssetPrice(
        gaugeData.vault,
        gaugeTypeToChainId[gaugeType]
      );

      const apy = await calculateGaugeApr(
        gaugeData,
        vaultAssetPriceInUsd,
        vcxPriceInUsd
      );

      const rewardApy = await getRewardsApy(
        gauge,
        gaugeData.workingSupply,
        vaultAssetPriceInUsd,
        gaugeTypeToChainId[gaugeType]
      );

      finalGaugeData[gauge] = {
        address: gauge,
        vault: gaugeData.vault!,
        lowerAPR: apy.lowerAPR + rewardApy,
        upperAPR: apy.upperAPR + rewardApy,
        rewardApy: rewardApy,
        minGaugeApy: apy.lowerAPR,
        maxGaugeApy: apy.lowerAPR
      };
    })
  );

  return res
    .status(200)
    .json(finalGaugeData);
}

function thisPeriodTimestamp(): number {
  const week = 604800 * 1000;
  return (Math.floor(Date.now() / week) * week) / 1000;
}

async function getTokenPrice(token: Address, chainId: number): Promise<number> {
  const key = `${networkMap[chainId].toLowerCase()}:${token}`;

  const { data } = await axios.get(
    `https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/coins/prices/current/${key}`
  );
  return data.coins[key]?.price;
}

async function getTokenPrices(tokens: Address[], chainId: number): Promise<number[]> {
  const { data: priceData } = await axios.get(
    `https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/coins/prices/current/${String(
      tokens.map(
        (token) => `${networkMap[chainId].toLowerCase()}:${token}`
      )
    )}`
  )
  return Object.keys(priceData.coins).map(key => priceData.coins[key]?.price || 0)
}

async function getVaultAssetPrice(vault: Address, chainId: number): Promise<number> {
  const asset = await clientByChainId[chainId].readContract({
    address: vault,
    abi: VaultAbi,
    functionName: "asset",
  });

  return await getTokenPrice(asset, chainId);
}

async function calculateGaugeApr(gaugeData: any, vaultPrice: number, vcxPrice: number) {
  // calculate the lowerAPR and upperAPR
  let lowerAPR = 0;
  let upperAPR = 0;
  // 25% discount for oVCX
  const oVcxPriceUSD = vcxPrice * 0.25;

  const relative_inflation =
    gaugeData.inflationRate * gaugeData.cappedRelativeWeight;
  if (relative_inflation > 0) {
    const annualRewardUSD = relative_inflation * 86400 * 365 * oVcxPriceUSD;
    const workingSupplyUSD =
      (gaugeData.workingSupply > 0 ? gaugeData.workingSupply : 1e18) *
      vaultPrice *
      1e9;

    lowerAPR =
      annualRewardUSD /
      workingSupplyUSD /
      (100 / gaugeData.tokenlessProduction);
    upperAPR = annualRewardUSD / workingSupplyUSD;
  }

  return {
    lowerAPR: lowerAPR * 100,
    upperAPR: upperAPR * 100,
  };
}

async function getGaugeData(gauge: Address, gaugeType: number) {
  const gaugeContract = {
    address: gauge,
    abi: GaugeAbi,
  };

  const isChildGauge = CHILD_GAUGE_TYPES.includes(gaugeType);

  let gaugeData: any[] = [];
  if (isChildGauge) {
    gaugeData = await clientByChainId[1].multicall({
      contracts: [
        {
          ...gaugeContract,
          functionName: "inflation_params", // root
        },
        {
          ...gaugeContract,
          functionName: "getCappedRelativeWeight", // root
          args: [BigInt(thisPeriodTimestamp())],
        },
      ],
      allowFailure: false,
    });
    const childData = await clientByChainId[
      gaugeTypeToChainId[gaugeType]
    ].multicall({
      contracts: [
        {
          ...gaugeContract,
          functionName: "tokenless_production", // child
        },
        {
          ...gaugeContract,
          functionName: "lp_token", // child
        },
      ],
      allowFailure: false,
    });
    gaugeData.push(...childData);
  } else {
    gaugeData = await clientByChainId[1].multicall({
      contracts: [
        {
          ...gaugeContract,
          functionName: "inflation_rate", // root
        },
        {
          ...gaugeContract,
          functionName: "getCappedRelativeWeight", // root
          args: [BigInt(thisPeriodTimestamp())],
        },
        {
          ...gaugeContract,
          functionName: "tokenless_production", // root
        },
        {
          ...gaugeContract,
          functionName: "lp_token", // root
        },
      ],
      allowFailure: false,
    });
  }

  const vaultData = await clientByChainId[
    gaugeTypeToChainId[gaugeType]
  ].multicall({
    contracts: [
      {
        address: gaugeData[3]!,
        abi: VaultAbi,
        functionName: "decimals",
      },
      {
        address: gaugeData[3]!,
        abi: VaultAbi,
        functionName: "balanceOf",
        args: [gauge],
      },
      {
        address: gaugeData[3]!,
        abi: VaultAbi,
        functionName: "totalAssets",
      },
      {
        address: gaugeData[3]!,
        abi: VaultAbi,
        functionName: "totalSupply",
      },
    ],
    allowFailure: false,
  });

  const assetsPerShare =
    Number(vaultData[3]) > 0
      ? (Number(vaultData[2]) + 1) / (Number(vaultData[3]) + 1e9)
      : Number(1e-9);

  return {
    vault: gaugeData[3],
    inflationRate:
      Number(isChildGauge ? gaugeData[0].rate : gaugeData[0]) / 1e18,
    cappedRelativeWeight: Number(gaugeData[1]) / 1e18,
    tokenlessProduction: Number(gaugeData[2]),
    workingSupply:
      (assetsPerShare * Number(vaultData[1])) / 10 ** Number(vaultData[0]),
  };
}


async function getRewardsApy(gauge: Address, workingSupply: number, vaultPrice: number, chainId: number) {
  const client = clientByChainId[chainId];

  // get all reward token via events
  const rewardLogs = await client.getContractEvents({
    address: gauge,
    abi: GaugeAbi,
    eventName: "RewardDistributorUpdated",
    fromBlock: "earliest",
    toBlock: "latest"
  })

  if (rewardLogs.length > 0) {
    const rewardData = await client.multicall({
      contracts: rewardLogs.map(log => {
        return {
          address: gauge,
          abi: GaugeAbi,
          functionName: "reward_data",
          args: [log.args.reward_token]
        }
      }),
      allowFailure: false
    }) as any[]

    const decimalData = await client.multicall({
      contracts: rewardLogs.map(log => {
        return {
          address: log.args.reward_token!,
          abi: ERC20Abi,
          functionName: "decimals",
        }
      }),
      allowFailure: false
    }) as number[]

    const prices = await getTokenPrices(rewardLogs.map(log => getAddress(log.args.reward_token!)), chainId)
    const annualRewardUSD: number = rewardData.reduce((a, b, i) => a + (((b[3] * 86400 * 365) / (10 ** decimalData[i])) * prices[i]), 0)
    const workingSupplyUSD =
      (workingSupply > 0 ? workingSupply : 1e18) *
      vaultPrice *
      1e9;
    return annualRewardUSD / workingSupplyUSD
  }
  return 0
}