import {
  Address,
  PublicClient,
  erc20Abi,
  getAddress,
  parseEther,
  zeroAddress,
} from "viem";
import axios from "axios";
import { VaultAbi } from "@/lib/constants/abi/Vault";
import { ApyData, Strategy, TokenByAddress, VaultData, VaultDataByAddress, VaultLabel, VaultMetadata, StrategyMetadata } from "@/lib/types";
import { ERC20Abi, VeTokenByChain } from "@/lib/constants";
import getGaugesData from "@/lib/gauges/getGaugeData";
import { EMPTY_LLAMA_APY_ENTRY, getApy } from "@/lib/resolver/apy";


export async function getInitialVaultsData(chainId: number, client: PublicClient): Promise<VaultDataByAddress> {
  const { data: allVaults } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/vaults/${chainId}.json`
  );

  const { data: hiddenVaults } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/vaults/hidden/${chainId}.json`
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
      totalAssets: BigInt(0),
      totalSupply: BigInt(0),
      assetsPerShare: 0,
      depositLimit: BigInt(0),
      withdrawalLimit: BigInt(0),
      tvl: 0,
      apyData: {
        targetApy: 0,
        baseApy: 0,
        rewardApy: 0,
        totalApy: 0,
        apyHist: [],
        apyId: vault.apyId,
        apySource: vault.apyId ? "defillama" : undefined
      } as ApyData,
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
      } as VaultMetadata,
      strategies: vault.strategies.map((strategy: Address) => {
        return {
          address: getAddress(strategy),
          asset: getAddress(vault.assetAddress),
          yieldToken: undefined,
          metadata: {
            name: "",
            protocol: "",
            description: "",
            type: "Vanilla"
          } as StrategyMetadata,
          resolver: "",
          allocation: BigInt(0),
          allocationPerc: 0,
          apyData: {
            targetApy: 0,
            baseApy: 0,
            rewardApy: 0,
            totalApy: 0,
            apyHist: [EMPTY_LLAMA_APY_ENTRY],
            apyId: "",
            apySource: "custom"
          } as ApyData,
          totalAssets: BigInt(0),
          totalSupply: BigInt(0),
          assetsPerShare: 0,
          idle: BigInt(0),
        } as Strategy
      }),
      idle: BigInt(0),
      liquid: BigInt(0),
      points: vault.points ? vault.points : []
    }
  })

  return result
}


export async function addDynamicVaultsData(vaults: VaultDataByAddress, client: PublicClient): Promise<VaultDataByAddress> {
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
    const totalAssets = dynamicValues[i] as bigint;
    const totalSupply = dynamicValues[i + 1] as bigint;

    vaults[vault.address].totalAssets = totalAssets;
    vaults[vault.address].totalSupply = totalSupply;
    vaults[vault.address].depositLimit = dynamicValues[i + 2] as bigint;
    vaults[vault.address].withdrawalLimit = totalSupply;
    vaults[vault.address].assetsPerShare = totalSupply > 0 ? Number(totalAssets) / Number(totalSupply) : 1;
    vaults[vault.address].idle = dynamicValues[i + 3] as bigint;
  })

  return vaults;
}


export async function addApyHist(vaults: VaultDataByAddress): Promise<VaultDataByAddress> {
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
    allowFailure: true
  })

  let n = 0
  Object.keys(vaults).forEach((address: any) => {
    let apyBase = 0;
    let apyRewards = 0;
    let liquid = BigInt(0);

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
          targetApy: 0,
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
        const allocation = ((strategyBalances[n].result as bigint ?? BigInt(0))
          * parseEther(strategyData.assetsPerShare.toLocaleString("fullwide", { useGrouping: false }).replace(",", "."))
        ) / parseEther("1")

        // calc allocation percentage
        const allocationPerc = Number(allocation) / Number(vaults[address].totalAssets) || 0

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
        if (vaults[address].totalSupply === BigInt(0)) {
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
    vaults[address].apyData.targetApy = apyBase + apyRewards;
    vaults[address].liquid = liquid + vaults[address].idle;
    vaults[address].withdrawalLimit = BigInt((Math.ceil(Number(liquid + vaults[address].idle) / vaults[address].assetsPerShare)).toLocaleString("fullwide", { useGrouping: false }).replace(",", "."))
  })


  return vaults
}

export async function addGaugeData(vaultsData: VaultDataByAddress, assets: TokenByAddress, gauges: TokenByAddress, account: Address, chainId: number): Promise<VaultDataByAddress> {
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