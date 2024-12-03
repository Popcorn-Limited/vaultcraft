import { NextApiRequest, NextApiResponse } from "next";
import { ChainById } from "@/lib/utils/connectors";
import { Address, zeroAddress } from "viem";
import { Balance, Point, Strategy, Token, TokenReward, VaultData, VaultMetadata } from "@/lib/types";
import getTokenAndVaultsDataByChain from "@/lib/getTokenAndVaultsData";

type VaultApiData = {
  address: Address;
  vault: TokenApiData;
  asset: TokenApiData;
  gauge?: TokenApiData;
  chainId: number;
  totalAssets: number;
  totalSupply: number;
  assetsPerShare: number;
  tvl: number;
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
  metadata: VaultMetadata;
  points: Point[];
}

type TokenApiData = Omit<Token, "balance" | "totalSupply"> & {
  balance: BalanceApiData;
  totalSupply: number;
}

type BalanceApiData = Omit<Balance, "value"> & {
  value: number;
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
  const account = req.query.account as Address

  let { vaultsData: vaultsDataArray, tokens, strategies } = await getTokenAndVaultsDataByChain({ chain: ChainById[chainId], account: account || zeroAddress })

  const result = vaultsDataArray.map(vault => {
    const vaultToken: TokenApiData = {
      ...tokens[vault.address],
      totalSupply: Number(tokens[vault.address].totalSupply),
      balance: { ...tokens[vault.address].balance, value: Number(tokens[vault.address].balance.value) }
    }
    const assetToken: TokenApiData = {
      ...tokens[vault.asset],
      totalSupply: Number(tokens[vault.asset].totalSupply),
      balance: { ...tokens[vault.asset].balance, value: Number(tokens[vault.asset].balance.value) }
    }
    const gaugeToken: TokenApiData | undefined = vault.gauge && vault.gauge !== zeroAddress ? {
      ...tokens[vault.gauge],
      totalSupply: Number(tokens[vault.gauge].totalSupply),
      balance: { ...tokens[vault.gauge].balance, value: Number(tokens[vault.gauge].balance.value) }
    } : undefined

    const vaultData: VaultApiData = {
      address: vault.address,
      vault: vaultToken,
      asset: assetToken,
      gauge: gaugeToken,
      chainId,
      totalAssets: Number(vault.totalAssets),
      totalSupply: Number(vault.totalSupply),
      assetsPerShare: vault.assetsPerShare,
      tvl: vault.tvl,
      depositLimit: Number(vault.depositLimit),
      withdrawalLimit: Number(vault.withdrawalLimit),
      minLimit: Number(vault.minLimit),
      fees: {
        deposit: Number(vault.fees.deposit),
        withdrawal: Number(vault.fees.withdrawal),
        management: Number(vault.fees.management),
        performance: Number(vault.fees.performance),
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
      baseApy: vault.apyData.baseApy + vault.apyData.rewardApy,
      metadata: vault.metadata,
      points: vault.points,
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