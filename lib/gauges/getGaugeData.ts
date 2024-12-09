import { Address, PublicClient, createPublicClient, erc20Abi, http, zeroAddress } from "viem";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { ChildGaugeAbi, GaugeAbi, ORACLES_DEPLOY_BLOCK, VCX, } from "@/lib/constants";
import { vcx as getVcxPrice } from "@/lib/resolver/price/resolver";
import { GaugeData, RewardApy, Token, TokenByAddress, VaultDataByAddress } from "@/lib/types";
import { thisPeriodTimestamp } from "./utils";
import { mainnet } from "viem/chains";

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

const TOKENLESS_PRODUCTION = 20

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

interface GaugeDataInputs {
  vaultsData: VaultDataByAddress;
  assets: TokenByAddress;
  account: Address;
  chainId: number;
  veToken?: Token;
  gauges?: TokenByAddress;
  addUserData?: boolean;
}

export default async function getGaugesData({
  vaultsData,
  assets,
  account,
  chainId,
  veToken,
  gauges,
  addUserData = false,
}: GaugeDataInputs): Promise<GaugeData[]> {
  // addUserData requires veToken and gauge
  if (addUserData && (!veToken || !gauges)) return []

  const vcxPriceInUsd = await getVcxPrice({ address: VCX, chainId: mainnet.id, client: undefined });
  const ovcxPrice = vcxPriceInUsd * 0.25;

  return chainId === mainnet.id ?
    getMainnetGaugesData({ vaultsData, assets, account, chainId: 1, veToken, gauges, addUserData, ovcxPrice }) :
    getChildGaugesData({ vaultsData, assets, account, chainId, veToken, gauges, addUserData, ovcxPrice });
}

async function getMainnetGaugesData({
  vaultsData,
  assets,
  account,
  chainId,
  veToken,
  gauges,
  addUserData,
  ovcxPrice
}: GaugeDataInputs & { ovcxPrice: number }): Promise<GaugeData[]> {
  const vaultsWithGauges = Object.values(vaultsData).filter(vault => vault.gauge !== zeroAddress)

  // @ts-ignore
  const mainnetData = await clientByChainId[1].multicall({
    contracts: vaultsWithGauges.map(vault => [
      {
        address: vault.address,
        abi: erc20Abi,
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
        functionName: "working_balances",
        args: [account]
      },
      {
        address: vault.gauge!,
        abi: GaugeAbi,
        functionName: "working_supply"
      }
    ]).flat(),
    allowFailure: false,
  }) as any[];

  return Promise.all(vaultsWithGauges.map(async (vault, i) => {
    if (i > 0) i = i * 5

    const workingSupplyAssets = (vault.assetsPerShare * Number(mainnetData[i])) / (10 ** assets[vault.asset].decimals);

    const { lowerAPR, upperAPR } = calcBaseApy({
      inflationRate: Number(mainnetData[i + 1]) / 1e18,
      cappedRelativeWeight: Number(mainnetData[i + 2]) / 1e18,
      workingSupply: workingSupplyAssets,
      tokenlessProduction: TOKENLESS_PRODUCTION,
      vaultPrice: assets[vault.asset].price,
      ovcxPrice: ovcxPrice
    })

    const rewardApy = await getRewardsApy({
      gauge: vault.gauge!,
      workingSupply: workingSupplyAssets,
      vaultPrice: assets[vault.asset].price,
      assets: assets,
      chainId: 1
    })

    const annualEmissions = ((Number(mainnetData[i + 1]) / 1e18) * (Number(mainnetData[i + 2]) / 1e18)) * 86400 * 365

    let workingBalance = Number(mainnetData[i + 3]);
    let workingSupply = Number(mainnetData[i + 4]);
    if (addUserData && veToken && gauges && vault.gauge && vault.gauge !== zeroAddress) {
      const updatedWorkingBalance = calcWorkingBalance(veToken, gauges[vault.gauge], TOKENLESS_PRODUCTION);
      workingSupply = workingSupply + updatedWorkingBalance - workingBalance;
      workingBalance = updatedWorkingBalance;
    }

    return {
      vault: vault.address,
      gauge: vault.gauge!,
      lowerAPR,
      upperAPR,
      annualEmissions: annualEmissions,
      annualRewardValue: annualEmissions * ovcxPrice,
      rewardApy,
      workingBalance,
      workingSupply
    }
  }))
}

async function getChildGaugesData({
  vaultsData,
  assets,
  account,
  chainId,
  veToken,
  gauges,
  addUserData,
  ovcxPrice
}: GaugeDataInputs & { ovcxPrice: number }): Promise<GaugeData[]> {
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
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [vault.gauge!],
      },
      {
        address: vault.gauge!,
        abi: GaugeAbi,
        functionName: "working_balances",
        args: [account]
      },
      {
        address: vault.gauge!,
        abi: GaugeAbi,
        functionName: "working_supply"
      },
    ]).flat(),
    allowFailure: false,
  }) as any[];

  return Promise.all(vaultsWithGauges.map(async (vault, i) => {
    let n = i;
    if (i > 0) {
      n = i * 3
      i = i * 2
    }

    const workingSupplyAssets = (vault.assetsPerShare * Number(chainData[n])) / (10 ** assets[vault.asset].decimals)

    const { lowerAPR, upperAPR } = calcBaseApy({
      inflationRate: Number(mainnetData[i].rate) / 1e18,
      cappedRelativeWeight: Number(mainnetData[i + 1]) / 1e18,
      workingSupply: workingSupplyAssets,
      tokenlessProduction: TOKENLESS_PRODUCTION,
      vaultPrice: assets[vault.asset].price,
      ovcxPrice: ovcxPrice
    })

    const rewardApy = await getRewardsApy({
      gauge: vault.gauge!,
      workingSupply: workingSupplyAssets,
      vaultPrice: assets[vault.asset].price,
      assets: assets,
      chainId
    })

    const annualEmissions = ((Number(mainnetData[i].rate) / 1e18) * (Number(mainnetData[i + 1]) / 1e18)) * 86400 * 365

    let workingBalance = Number(chainData[n + 1]);
    let workingSupply = Number(chainData[n + 2]);
    if (addUserData && veToken && gauges && vault.gauge && vault.gauge !== zeroAddress) {
      const updatedWorkingBalance = calcWorkingBalance(veToken, gauges[vault.gauge], TOKENLESS_PRODUCTION);
      workingSupply = workingSupply + updatedWorkingBalance - workingBalance;
      workingBalance = updatedWorkingBalance;
    }

    return {
      vault: vault.address,
      gauge: vault.gauge!,
      lowerAPR,
      upperAPR,
      annualEmissions: annualEmissions,
      annualRewardValue: annualEmissions * ovcxPrice,
      rewardApy,
      workingBalance,
      workingSupply,
    }
  })
  )
}

function calcBaseApy({
  inflationRate,
  cappedRelativeWeight,
  workingSupply,
  tokenlessProduction,
  vaultPrice,
  ovcxPrice
}: {
  inflationRate: number,
  cappedRelativeWeight: number,
  workingSupply: number,
  tokenlessProduction: number,
  vaultPrice: number,
  ovcxPrice: number
}): { lowerAPR: number, upperAPR: number } {
  // calculate the lowerAPR and upperAPR
  let lowerAPR = 0;
  let upperAPR = 0;

  const relative_inflation =
    inflationRate * cappedRelativeWeight;
  if (relative_inflation > 0) {
    const annualRewardUSD = relative_inflation * 86400 * 365 * ovcxPrice;
    const workingSupplyUSD =
      (workingSupply > 0 ? workingSupply : 1e18) * vaultPrice;

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
  assets,
  chainId
}: {
  gauge: Address,
  workingSupply: number,
  vaultPrice: number,
  assets: TokenByAddress,
  chainId: number
}): Promise<RewardApy> {
  const client = clientByChainId[chainId];

  // get all reward token via events
  const rewardLogs = await client.getContractEvents({
    address: gauge,
    abi: chainId === mainnet.id ? GaugeAbi : ChildGaugeAbi,
    eventName: chainId === mainnet.id ? "RewardDistributorUpdated" : "AddReward",
    fromBlock: ORACLES_DEPLOY_BLOCK[chainId] === 0 ? "earliest" : BigInt(ORACLES_DEPLOY_BLOCK[chainId]),
    toBlock: "latest",
  }) as any[];

  if (rewardLogs.length > 0) {
    // @ts-ignore
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

    const workingSupplyUSD =
      (workingSupply > 0 ? workingSupply : 1e18) * vaultPrice;


    const rewardData = rewardRes.map((data, i) => {
      const rewardAddress = rewardLogs[i].args.reward_token!;
      const rewardEnded = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) >= Number(data.period_finish) * 1000
      const emissions = rewardEnded ? 0 : ((Number(data.rate) / 1e18) * 86400 * 365) / (10 ** assets[rewardAddress].decimals)
      const emissionsValue = emissions * assets[rewardAddress].price;
      return {
        address: rewardAddress,
        emissions: emissions,
        emissionsValue: emissionsValue,
        apy: (emissionsValue / workingSupplyUSD) * 100
      }
    })

    const annualRewardUSD: number = rewardData.reduce((a, b,) => a + b.emissionsValue, 0)
    return { rewards: rewardData, annualRewardValue: annualRewardUSD, apy: (annualRewardUSD / workingSupplyUSD) * 100 }
  }
  return { rewards: [], annualRewardValue: 0, apy: 0 }
}


function calcWorkingBalance(veToken: Token, gauge: Token, tokenlessProduction: number) {
  let workingBalance = (Number(gauge.balance.value) * tokenlessProduction) / 100
  if (veToken.balance.value > 0) {
    workingBalance += Number((gauge.totalSupply * veToken.balance.value) / veToken.totalSupply) * ((100 - tokenlessProduction) / 100)
  }
  return Math.min(Number(gauge.balance.value), workingBalance)
}