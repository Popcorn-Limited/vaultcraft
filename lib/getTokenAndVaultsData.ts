import {
  Address,
  Chain,
  PublicClient,
  createPublicClient,
  erc20Abi,
  getAddress,
  http,
  zeroAddress,
} from "viem";
import axios from "axios";
import { VaultAbi } from "@/lib/constants/abi/Vault";
import { Strategy, StrategyByAddress, TokenByAddress, VaultData, VaultDataByAddress, VaultLabel } from "@/lib/types";
import { ChildGaugeAbi, ERC20Abi, GaugeAbi, OptionTokenByChain, ST_VCX, VCX, VCX_LP, VE_VCX, VeTokenByChain, XVCXByChain, ZapAssetAddressesByChain } from "@/lib/constants";
import { GAUGE_NETWORKS, RPC_URLS } from "@/lib/utils/connectors";
import { YieldOptions } from "vaultcraft-sdk";
import { prepareAssets, prepareVaults, addBalances, prepareGauges } from "@/lib/tokens";
import getGaugesData from "@/lib/gauges/getGaugeData";
import { mainnet } from "viem/chains";
import prepareStrategies from "@/lib/prepareStrategies";
import { EMPTY_LLAMA_APY_ENTRY, getApy } from "@/lib/resolver/apy";

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

  // Add totalAssets, totalSupply, assetsPerShare and depositLimit
  vaultsData = await addDynamicVaultsData(vaultsData, client)

  // Add apyHist
  vaultsData = await addApyHist(vaultsData)

  const strategies = await prepareStrategies(vaultsData, chainId, client)

  // Add strategy data
  vaultsData = await addStrategyData(vaultsData, strategies, client)

  // Create token array
  const uniqueAssetAdresses: Address[] = [...ZapAssetAddressesByChain[chainId]];
  if (chainId === 1) uniqueAssetAdresses.push(...[VCX, VCX_LP, VE_VCX, ST_VCX])
  if (GAUGE_NETWORKS.includes(chainId)) uniqueAssetAdresses.push(...[OptionTokenByChain[chainId], VeTokenByChain[chainId], XVCXByChain[chainId]])

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
  if (GAUGE_NETWORKS.includes(client.chain.id)) {
    // @ts-ignore
    for (let [i, vault] of Object.values(vaultsData).entries()) {
      if (vault.gauge !== zeroAddress) {
        const rewardLog = await client.getContractEvents({
          address: vault.gauge,
          abi: chainId === mainnet.id ? GaugeAbi : ChildGaugeAbi,
          eventName: chainId === mainnet.id ? "RewardDistributorUpdated" : "AddReward",
          fromBlock: "earliest",
          toBlock: "latest",
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
    vault.tvl = (vault.totalAssets * assets[vault.asset].price) / (10 ** assets[vault.asset].decimals);
  });

  // add gauge data
  if (Object.keys(gauges).length > 0) {
    vaultsData = await addGaugeData(vaultsData, assets, gauges, account, chainId)
  }

  return { vaultsData: Object.values(vaultsData), tokens, strategies };
}

async function getInitialVaultsData(chainId: number, client: PublicClient): Promise<VaultDataByAddress> {
  const { data: allVaults } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/${chainId}.json`
  );

  const { data: hiddenVaults } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/hidden/${chainId}.json`
  );

  const filteredVaults = Object.values(allVaults)
    .filter((vault: any) => !hiddenVaults.includes(vault.address))
    .filter((vault: any) => vault.type !== "single-asset-lock-vault-v1")

  let result: VaultDataByAddress = {};
  filteredVaults.forEach((vault: any, i: number) => {
    result[getAddress(vault.address)] = {
      address: getAddress(vault.address),
      vault: getAddress(vault.address),
      asset: getAddress(vault.assetAddress),
      gauge: getAddress(vault.gauge || zeroAddress),
      chainId: vault.chainId,
      fees: vault.fees,
      totalAssets: 0,
      totalSupply: 0,
      assetsPerShare: 0,
      depositLimit: 0,
      tvl: 0,
      apyData: {
        baseApy: 0,
        rewardApy: 0,
        totalApy: 0,
        apyHist: [],
        apyId: vault.apyId,
        apySource: vault.apyId ? "defillama" : undefined
      },
      gaugeData: undefined,
      metadata: {
        vaultName: vault.name ? vault.name : undefined,
        labels: vault.labels
          ? vault.labels.map((label: string) => <VaultLabel>label)
          : undefined,
        description: vault.description || undefined,
        type: vault.type,
        creator: getAddress(vault.creator || zeroAddress),
        feeRecipient: getAddress(vault.feeRecipient || zeroAddress),
      },
      strategies: vault.strategies.map((strategy: Address) => {
        return {
          address: getAddress(strategy),
          metadata: {
            name: "",
            description: "",
          },
          resolver: "",
          allocation: 0,
          allocationPerc: 0,
          apy: 0
        }
      }),
      idle: 0,
      liquid: 0,
      points: vault.points ? vault.points : []
    }
  })

  return result
}


async function addDynamicVaultsData(vaults: VaultDataByAddress, client: PublicClient): Promise<VaultDataByAddress> {
  // @ts-ignore
  const dynamicValues = await client.multicall({
    contracts: Object.values(vaults)
      .map((vault: any) => {
        return [
          {
            address: vault.address,
            abi: VaultAbi,
            functionName: "totalAssets"
          },
          {
            address: vault.address,
            abi: VaultAbi,
            functionName: "totalSupply"
          },
          {
            address: vault.address,
            abi: VaultAbi,
            functionName: "depositLimit"
          },
          {
            address: vault.asset,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [vault.address]
          },
        ]
      })
      .flat(),
    allowFailure: false,
  });

  Object.values(vaults).forEach((vault: any, i: number) => {
    if (i > 0) i = i * 4;
    const totalAssets = Number(dynamicValues[i]);
    const totalSupply = Number(dynamicValues[i + 1]);

    vaults[vault.address].totalAssets = totalAssets;
    vaults[vault.address].totalSupply = totalSupply;
    vaults[vault.address].depositLimit = Number(dynamicValues[i + 2]);
    vaults[vault.address].assetsPerShare = totalSupply > 0 ? totalAssets / totalSupply : Number(1);
    vaults[vault.address].idle = Number(dynamicValues[i + 3]);

  })

  return vaults;
}


async function addApyHist(vaults: VaultDataByAddress): Promise<VaultDataByAddress> {
  const apyHistAll = await Promise.all(Object.values(vaults).map(async (vault: VaultData) => {
    if (vault.apyData.apyId?.length > 0) return getApy(vault.apyData.apyId)
    return []
  }))

  Object.values(vaults).forEach((vault: any, i: number) => {
    let hist = apyHistAll[i]

    // Cut off the first few days to normalise the apy chart (first few days of a new vault with low deposits arent representable)
    if (hist.length > 10) {
      hist = hist.slice(10, hist.length - 1)
    }

    vaults[vault.address].apyData.apyHist = hist
  })

  return vaults
}

export async function addStrategyData(vaults: VaultDataByAddress, strategies: { [key: Address]: Strategy }, client: PublicClient): Promise<VaultDataByAddress> {
  const strategyBalances = await client.multicall({
    contracts:
      Object.values(vaults)
        .map((vault: any) => vault.strategies.map((strategy: any) => {
          return {
            address: strategy.address,
            abi: ERC20Abi,
            functionName: "balanceOf",
            args: [vault.address]
          }
        }))
        .flat(),
    allowFailure: false
  })

  let n = 0
  Object.keys(vaults).forEach((address: any) => {
    let apyBase = 0;
    let apyRewards = 0;
    let liquid = 0;

    if (vaults[address].strategies.length === 0) {
      vaults[address].strategies[0] = {
        address: zeroAddress,
        asset: vaults[address].asset,
        yieldToken: undefined,
        metadata: {
          name: "Stake",
          protocol: "VaultCraft",
          description: "This vault holds funds to incentivise via gauges.",
          type: "Vanilla"
        },
        resolver: "",
        allocation: vaults[address].totalAssets,
        allocationPerc: 1,
        apyData: {
          baseApy: 0,
          rewardApy: 0,
          totalApy: 0,
          apyHist: [EMPTY_LLAMA_APY_ENTRY],
          apyId: "",
          apySource: "custom"
        },
        totalAssets: vaults[address].totalAssets,
        totalSupply: vaults[address].totalSupply,
        assetsPerShare: vaults[address].assetsPerShare,
        idle: vaults[address].totalAssets
      }
      liquid = vaults[address].totalAssets
    } else {
      vaults[address].strategies.forEach((strategy: any, i: number) => {
        const strategyData = strategies[strategy.address]

        // calc allocation in assets
        const allocation = Number(strategyBalances[n]) * strategyData.assetsPerShare

        // calc allocation percentage
        const allocationPerc = (allocation / vaults[address].totalAssets) || 0

        // Idle assets in the strategy accessiable by the vault
        const idle = ["AnyToAnyV1", "AnyToAnyCompounderV1"].includes(strategyData.metadata.type) ? strategyData.idle : allocation

        // add strategy metadata
        vaults[address].strategies[i] = {
          ...strategyData,
          allocation,
          allocationPerc,
          idle
        }

        // calc blended apy of the vault
        if (vaults[address].totalSupply === 0) {
          // Assume even allocation if the vault doesnt have allocations yet
          apyBase += strategyData.apyData.baseApy * (1 / vaults[address].strategies.length)
          apyRewards += strategyData.apyData.rewardApy * (1 / vaults[address].strategies.length)
        } else {
          apyBase += strategyData.apyData.baseApy * allocationPerc
          apyRewards += strategyData.apyData.rewardApy * allocationPerc
          liquid += idle
        }

        n += 1
      })
    }

    // assign apy
    vaults[address].apyData.baseApy = apyBase;
    vaults[address].apyData.rewardApy = apyRewards;
    vaults[address].apyData.totalApy = apyBase + apyRewards;
    vaults[address].liquid = liquid + vaults[address].idle;
  })


  return vaults
}

async function addGaugeData(vaultsData: VaultDataByAddress, assets: TokenByAddress, gauges: TokenByAddress, account: Address, chainId: number): Promise<VaultDataByAddress> {
  const gaugesData = await getGaugesData({ vaultsData, assets, account, chainId, veToken: assets[VeTokenByChain[chainId]], gauges, addUserData: true });

  gaugesData.forEach(gaugeData => {
    const vault = vaultsData[gaugeData.vault]

    if (vault) {
      vault.apyData.totalApy += gaugeData.upperAPR + gaugeData.rewardApy.apy || 0;
      vault.gaugeData = gaugeData;

      vaultsData[vault.address] = vault;
    }
  });

  return vaultsData;
}