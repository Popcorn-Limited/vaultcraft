import { NextApiRequest, NextApiResponse } from "next";
import { ChainById } from "@/lib/utils/connectors";
import { zeroAddress } from "viem";
import { TokenReward, VaultData, VaultDataByAddress } from "@/lib/types";
import getTokenAndVaultsDataByChain from "@/lib/getTokenAndVaultsData";
import getGaugesData from "@/lib/gauges/getGaugeData";

type VaultApiData = VaultData & {
  baseApy?: number;
  minBoost?: number;
  maxBoost?: number;
  gaugeLowerApr?: number;
  gaugeUpperApr?: number;
  rewards?: TokenReward[];
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
      apyData: {
        ...vault.apyData,
        apyHist: [],
      },
      strategies: vault.strategies.map(strategy => {
        return {
          ...strategy,
          apyData: {
            ...strategy.apyData,
            apyHist: [],
          },
        }
      }),
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