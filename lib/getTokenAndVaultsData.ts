import {
  Address,
  Chain,
  createPublicClient,
  http,
  zeroAddress,
} from "viem";
import { StrategyByAddress, TokenByAddress, VaultData } from "@/lib/types";
import { ChildGaugeAbi, GaugeAbi, OptionTokenByChain, ST_VCX, VCX, VCX_LP, VE_VCX, VeTokenByChain, XVCXByChain,WVCXByChain, ZapAssetAddressesByChain, ORACLES_DEPLOY_BLOCK } from "@/lib/constants";
import { GAUGE_NETWORKS, RPC_URLS } from "@/lib/utils/connectors";
import { prepareAssets, prepareVaults, addBalances, prepareGauges } from "@/lib/tokens";
import { mainnet } from "viem/chains";
import prepareStrategies from "@/lib/prepareStrategies";
import { addApyHist, addDynamicVaultsData, addGaugeData, addSafeStrategyData, addStrategyData, getInitialVaultsData } from "@/lib/vault/prepareVaultData";
import { formatBalance } from "./utils/helpers";

interface GetVaultsByChainProps {
  chain: Chain;
  account?: Address;
}

export default async function getTokenAndVaultsDataByChain({
  chain,
  account = zeroAddress,
}: GetVaultsByChainProps): Promise<{ vaultsData: VaultData[], tokens: TokenByAddress, strategies: StrategyByAddress }> {
  const client = createPublicClient({
    chain,
    transport: http(RPC_URLS[chain.id]),
  });
  const chainId = chain.id;

  // Fetch vaults and strategy data from database
  let vaultsData = await getInitialVaultsData(chainId, client)

  if (Object.keys(vaultsData).length === 0) {
    return { vaultsData: [], tokens: {}, strategies: {} }
  }

  // Add totalAssets, totalSupply, assetsPerShare and depositLimit
  vaultsData = await addDynamicVaultsData(vaultsData, client)

  // Add apyHist
  vaultsData = await addApyHist(vaultsData)

  const strategies = await prepareStrategies(vaultsData, chainId, client)

  // Add strategy data
  vaultsData = await addStrategyData(vaultsData, strategies, client)

  // Add safe strategy data
  vaultsData = await addSafeStrategyData(vaultsData, chainId, client)

  // Create token array
  const uniqueAssetAdresses: Address[] = [...ZapAssetAddressesByChain[chainId]];
  if (chainId === 1) uniqueAssetAdresses.push(...[VCX, VCX_LP, VE_VCX, ST_VCX])
  if (GAUGE_NETWORKS.includes(chainId)) uniqueAssetAdresses.push(...[OptionTokenByChain[chainId], VeTokenByChain[chainId], XVCXByChain[chainId], WVCXByChain[chainId]])

  // Add vault assets
  Object.values(vaultsData).forEach((vault) => {
    vault.strategies.forEach((strategy) => {
      if (strategy.yieldToken && !uniqueAssetAdresses.includes(strategy.yieldToken)) {
        uniqueAssetAdresses.push(strategy.yieldToken);
      }
    })
    if (!uniqueAssetAdresses.includes(vault.asset)) {
      uniqueAssetAdresses.push(vault.asset);
    }
  });

  // Add aave assets
  // if (chainId !== xLayer.id) {
  //   try {
  //     const reserveData = await client.readContract({
  //       address: AaveUiPoolProviderByChain[chainId],
  //       abi: AavePoolUiAbi,
  //       functionName: 'getReservesData',
  //       args: [AavePoolAddressProviderByChain[chainId]],
  //     })
  //     reserveData[0].filter(d => !d.isFrozen && !uniqueAssetAdresses.includes(d.underlyingAsset))
  //       .forEach(d => uniqueAssetAdresses.push(d.underlyingAsset))
  //   } catch (e) {
  //     console.log(`Aave (${chainId}) fetching error: `, e)
  //   }
  // }

  // Add reward token addresses
  if (GAUGE_NETWORKS.includes(chainId)) {
    // @ts-ignore
    for (let [i, vault] of Object.values(vaultsData).entries()) {
      if (vault.gauge !== zeroAddress) {
        const latestBl = await client.getBlockNumber();
        const deployBlock = ORACLES_DEPLOY_BLOCK[chainId];
        const fromBlock = deployBlock === 0 ? "earliest" : BigInt(deployBlock) <= latestBl - BigInt(10000) ? latestBl - BigInt(9999) : BigInt(deployBlock)

        const rewardLog = await client.getContractEvents({
          address: vault.gauge,
          abi: chainId === mainnet.id ? GaugeAbi : ChildGaugeAbi,
          eventName: chainId === mainnet.id ? "RewardDistributorUpdated" : "AddReward",
          fromBlock,
          toBlock: latestBl,
        }) as any[]

        rewardLog.forEach((log) => {
          if (!uniqueAssetAdresses.includes(log.args.reward_token)) {
            uniqueAssetAdresses.push(log.args.reward_token);
          }
        });
      }
    }
  }

  const assets = await prepareAssets(uniqueAssetAdresses, chainId, client);

  const vaults = await prepareVaults(vaultsData, assets, chainId);

  const gauges = await prepareGauges(Object.values(vaultsData).filter(vault => vault.gauge !== zeroAddress), vaults, client);

  // Add balances
  let tokens = { ...assets, ...vaults, ...gauges }
  if (account !== zeroAddress) {
    tokens = await addBalances(tokens, account, client)
  }

  // Calc vault tvl
  Object.values(vaultsData).forEach(vault => {
    vault.tvl = Number(formatBalance(vault.totalAssets, assets[vault.asset].decimals)) * assets[vault.asset].price

  });

  // add gauge data
  if (Object.keys(gauges).length > 0) {
    vaultsData = await addGaugeData(vaultsData, assets, gauges, account, chainId)
  }

  // Exceptions and specific overrides
  if (chainId === 1) {
    // Set Target rate for LBTC vault
    if (vaultsData["0xCe3Ac66020555EdcE9b54dAD5EC1c35E0478B887"].apyData.targetApy < 6) vaultsData["0xCe3Ac66020555EdcE9b54dAD5EC1c35E0478B887"].apyData.targetApy = 6;
  }


  return { vaultsData: Object.values(vaultsData), tokens, strategies };
}