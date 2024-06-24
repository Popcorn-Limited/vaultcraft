import { Address, PublicClient, createPublicClient, http, zeroAddress } from "viem";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { ChildGaugeAbi, GaugeAbi, VCX, } from "@/lib/constants";
import { vcx as getVcxPrice } from "@/lib/resolver/price/resolver";
import { erc20ABI, mainnet } from "wagmi";
import { GaugeData, RewardApy, TokenByAddress, VaultDataByAddress } from "@/lib/types";
import { thisPeriodTimestamp } from "./utils";

const HIDDEN_GAUGES = [
  "0x38098e3600665168eBE4d827D24D0416efC24799", // Deployment script ran out of gas and somehow added a random address into the gauges which now breaks these calls
  "0xF4c8736c1cf9b03ccB09DA6e8A8312E75CA5B529", // Failed Op Gauge Test
];

const gaugeTypeToChainId: { [id: number]: number } = {
  0: 1,
  1: 1,
  2: 1,
  3: 10,
  4: 42161,
};

const CHILD_GAUGE_TYPES: number[] = [3, 4];

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

export default async function getGaugesData({
  vaultsData,
  tokens,
  account,
  chainId
}: {
  vaultsData: VaultDataByAddress,
  tokens: TokenByAddress,
  account: Address,
  chainId: number
}): Promise<GaugeData[]> {
  const vcxPriceInUsd = await getVcxPrice({ address: VCX, chainId: mainnet.id, client: undefined });
  const ovcxPrice = vcxPriceInUsd * 0.25;

  return chainId === mainnet.id ?
    getMainnetGaugesData({ vaultsData, tokens, account, ovcxPrice }) :
    getChildGaugesData({ vaultsData, tokens, account, chainId, ovcxPrice });
}

async function getMainnetGaugesData({
  vaultsData,
  tokens,
  account,
  ovcxPrice
}: {
  vaultsData: VaultDataByAddress,
  tokens: TokenByAddress,
  account: Address,
  ovcxPrice: number
}): Promise<GaugeData[]> {
  const vaultsWithGauges = Object.values(vaultsData).filter(vault => vault.gauge !== zeroAddress)

  const mainnetData = await clientByChainId[1].multicall({
    contracts: vaultsWithGauges.map(vault => [
      {
        address: vault.address,
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [vault.gauge!],
      },
      {
        address: vault.gauge!,
        abi: GaugeAbi,
        functionName: "inflation_rate",
      },
      {
        address: vault.gauge!,
        abi: GaugeAbi,
        functionName: "getCappedRelativeWeight",
        args: [BigInt(thisPeriodTimestamp())],
      },
      {
        address: vault.gauge!,
        abi: GaugeAbi,
        functionName: "working_supply"
      },
      {
        address: vault.gauge!,
        abi: GaugeAbi,
        functionName: "working_balances",
        args: [account]
      }
    ]).flat(),
    allowFailure: false,
  }) as any[];

  return Promise.all(vaultsWithGauges.map(async (vault, i) => {
    if (i > 0) i = i * 5

    const workingSupplyAssets = (vault.assetsPerShare * Number(mainnetData[i])) / (10 ** (tokens[vault.asset].decimals))

    const { lowerAPR, upperAPR } = calcBaseApy({
      inflationRate: Number(mainnetData[i + 1]) / 1e18,
      cappedRelativeWeight: Number(mainnetData[i + 2]) / 1e18,
      workingSupply: workingSupplyAssets,
      tokenlessProduction: 20,
      assetPrice: tokens[vault.asset].price,
      ovcxPrice: ovcxPrice
    })

    const rewardApy = await getRewardsApy({
      gauge: vault.gauge!,
      workingSupply: workingSupplyAssets,
      vaultPrice: tokens[vault.address].price,
      tokens: tokens,
      chainId: 1
    })

    const annualEmissions = ((Number(mainnetData[i + 1]) / 1e18) * (Number(mainnetData[i + 2]) / 1e18)) * 86400 * 365
    return {
      vault: vault.address,
      gauge: vault.gauge!,
      lowerAPR,
      upperAPR,
      annualEmissions: annualEmissions,
      annualRewardValue: annualEmissions * ovcxPrice,
      rewardApy,
      workingSupply: Number(mainnetData[i + 3]),
      workingBalance: Number(mainnetData[i + 4])
    }
  })
  )
}

async function getChildGaugesData({
  vaultsData,
  tokens,
  account,
  chainId,
  ovcxPrice
}: {
  vaultsData: VaultDataByAddress,
  tokens: TokenByAddress,
  account: Address,
  chainId: number,
  ovcxPrice: number
}): Promise<GaugeData[]> {
  const vaultsWithGauges = Object.values(vaultsData).filter(vault => vault.gauge !== zeroAddress)

  const mainnetData = await clientByChainId[1].multicall({
    contracts: vaultsWithGauges.map(vault => [
      {
        address: vault.gauge!,
        abi: GaugeAbi,
        functionName: "inflation_params", // root
      },
      {
        address: vault.gauge!,
        abi: GaugeAbi,
        functionName: "getCappedRelativeWeight", // root
        args: [BigInt(thisPeriodTimestamp())],
      }
    ]).flat(),
    allowFailure: false,
  }) as any[];

  const chainData = await clientByChainId[chainId].multicall({
    contracts: vaultsWithGauges.map(vault => [
      {
        address: vault.address,
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [vault.gauge!],
      },
      {
        address: vault.gauge!,
        abi: GaugeAbi,
        functionName: "working_supply"
      },
      {
        address: vault.gauge!,
        abi: GaugeAbi,
        functionName: "working_balances",
        args: [account]
      }
    ]).flat(),
    allowFailure: false,
  }) as any[];

  return Promise.all(vaultsWithGauges.map(async (vault, i) => {
    let n = i;
    if (i > 0) {
      n = i * 3
      i = i * 2
    }

    const workingSupplyAssets = (vault.assetsPerShare * Number(chainData[n])) / (10 ** tokens[vault.address].decimals)

    const { lowerAPR, upperAPR } = calcBaseApy({
      inflationRate: Number(mainnetData[i].rate) / 1e18,
      cappedRelativeWeight: Number(mainnetData[i + 1]) / 1e18,
      workingSupply: workingSupplyAssets,
      tokenlessProduction: 20,
      assetPrice: tokens[vault.asset].price,
      ovcxPrice: ovcxPrice
    })

    const rewardApy = await getRewardsApy({
      gauge: vault.gauge!,
      workingSupply: workingSupplyAssets,
      vaultPrice: tokens[vault.address].price,
      tokens: tokens,
      chainId
    })

    const annualEmissions = ((Number(mainnetData[i].rate) / 1e18) * (Number(mainnetData[i + 1]) / 1e18)) * 86400 * 365
    return {
      vault: vault.address,
      gauge: vault.gauge!,
      lowerAPR,
      upperAPR,
      annualEmissions: annualEmissions,
      annualRewardValue: annualEmissions * ovcxPrice,
      rewardApy,
      workingSupply: Number(chainData[n + 1]),
      workingBalance: Number(chainData[n + 2])
    }
  })
  )
}

function calcBaseApy({
  inflationRate,
  cappedRelativeWeight,
  workingSupply,
  tokenlessProduction,
  assetPrice,
  ovcxPrice
}: {
  inflationRate: number,
  cappedRelativeWeight: number,
  workingSupply: number,
  tokenlessProduction: number,
  assetPrice: number,
  ovcxPrice: number
}): { lowerAPR: number, upperAPR: number } {
  // calculate the lowerAPR and upperAPR
  let lowerAPR = 0;
  let upperAPR = 0;

  const relative_inflation =
    inflationRate * cappedRelativeWeight;
  if (relative_inflation > 0) {
    const annualRewardUSD = relative_inflation * 86400 * 365 * ovcxPrice;
    const workingSupplyUSD = (workingSupply > 0 ? workingSupply : 1e18) * assetPrice;

    lowerAPR =
      annualRewardUSD /
      workingSupplyUSD /
      (100 / tokenlessProduction);
    upperAPR = annualRewardUSD / workingSupplyUSD;
  }

  return {
    lowerAPR: lowerAPR * 100,
    upperAPR: upperAPR * 100,
  };
}

async function getRewardsApy({
  gauge,
  workingSupply,
  vaultPrice,
  tokens,
  chainId
}: {
  gauge: Address,
  workingSupply: number,
  vaultPrice: number,
  tokens: TokenByAddress,
  chainId: number
}): Promise<RewardApy> {
  const client = clientByChainId[chainId];

  // get all reward token via events
  const rewardLogs = await client.getContractEvents({
    address: gauge,
    abi: chainId === mainnet.id ? GaugeAbi : ChildGaugeAbi,
    eventName: chainId === mainnet.id ? "RewardDistributorUpdated" : "AddReward",
    fromBlock: "earliest",
    toBlock: "latest",
  }) as any[];

  if (rewardLogs.length > 0) {
    const rewardRes = await client.multicall({
      contracts: rewardLogs.map(log => {
        return {
          address: gauge,
          abi: chainId === mainnet.id ? GaugeAbi : ChildGaugeAbi,
          functionName: "reward_data",
          args: [log.args.reward_token]
        }
      }),
      allowFailure: false
    }) as any[]

    const rewardData = rewardRes.map((data, i) => {
      const rewardAddress = rewardLogs[i].args.reward_token!;
      const emissions = ((Number(data.rate) / 1e18) * 86400 * 365) / (10 ** tokens[rewardAddress].decimals)
      return {
        address: rewardAddress,
        emissions: emissions,
        emissionsValue: emissions * tokens[rewardAddress].price
      }
    })

    const annualRewardUSD: number = rewardData.reduce((a, b,) => a + b.emissionsValue, 0)
    const workingSupplyUSD = (workingSupply > 0 ? workingSupply : 1e18) * vaultPrice;
    return { rewards: rewardData, annualRewardValue: annualRewardUSD, apy: (annualRewardUSD / workingSupplyUSD) * 100 }
  }
  return { rewards: [], annualRewardValue: 0, apy: 0 }
}