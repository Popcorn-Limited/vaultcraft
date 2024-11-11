import { NextApiRequest, NextApiResponse } from "next";
import { ChainById } from "@/lib/utils/connectors";
import { zeroAddress } from "viem";
import { Strategy, TokenReward, VaultData } from "@/lib/types";
import getTokenAndVaultsDataByChain from "@/lib/getTokenAndVaultsData";

type VaultApiData = Omit<VaultData, "totalAssets" | "totalSupply" | "depositLimit" | "withdrawalLimit" | "minLimit" | "idle" | "liquid" | "fees" | "strategies"> & {
  totalAssets: number;
  totalSupply: number;
  depositLimit: number;
  withdrawalLimit: number;
  minLimit: number;
  idle: number;
  liquid: number;
  fees: {
    deposit: number;
    withdrawal: number;
    management: number;
    performance: number;
  };
  strategies: StrategyApiData[];
  baseApy?: number;
  minBoost?: number;
  maxBoost?: number;
  gaugeLowerApr?: number;
  gaugeUpperApr?: number;
  rewards?: TokenReward[];
}

type StrategyApiData = Omit<Strategy, "allocation" | "totalAssets" | "totalSupply" | "idle" | "liquid"> & {
  allocation: number;
  totalAssets: number;
  totalSupply: number;
  idle: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VaultApiData[] | { error: String; }>
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "can only GET vaults" });
  }

  if (!req.query.chainId || !Object.keys(ChainById).includes(req.query.chainId as string)) {
    res.status(400).json({ error: "invalid chainId" });
  }

  const chainId = Number(req.query.chainId)

  let { vaultsData: vaultsDataArray, tokens, strategies } = await getTokenAndVaultsDataByChain({ chain: ChainById[chainId], account: zeroAddress })

  const result = vaultsDataArray.map(vault => {
    const vaultData: VaultApiData = {
      ...vault,
      totalAssets: Number(vault.totalAssets),
      totalSupply: Number(vault.totalSupply),
      depositLimit: Number(vault.depositLimit),
      withdrawalLimit: Number(vault.withdrawalLimit),
      minLimit: Number(vault.minLimit),
      fees: {
        deposit: Number(vault.fees.deposit),
        withdrawal: Number(vault.fees.withdrawal),
        management: Number(vault.fees.management),
        performance: Number(vault.fees.performance),
      },
      apyData: {
        ...vault.apyData,
        apyHist: [],
      },
      strategies: vault.strategies.map(strategy => {
        return {
          ...strategy,
          allocation: Number(strategy.allocation),
          totalAssets: Number(strategy.totalAssets),
          totalSupply: Number(strategy.totalSupply),
          idle: Number(strategy.idle),
          apyData: {
            ...strategy.apyData,
            apyHist: [],
          },
        }
      }),
      idle: Number(vault.idle),
      liquid: Number(vault.liquid),
      baseApy: vault.apyData.baseApy + vault.apyData.rewardApy
    }

    if (vault.gauge && vault.gauge !== zeroAddress && vault.gaugeData) {
      vaultData.minBoost = vault.gaugeData.lowerAPR
      vaultData.maxBoost = vault.gaugeData.upperAPR;
      vaultData.gaugeLowerApr = vault.gaugeData.lowerAPR + vault.gaugeData.rewardApy.apy;
      vaultData.gaugeUpperApr = vault.gaugeData.upperAPR + vault.gaugeData.rewardApy.apy;
      vaultData.rewards = vault.gaugeData.rewardApy.rewards
    }

    return vaultData
  })

  return res
    .status(200)
    .json(result);

}