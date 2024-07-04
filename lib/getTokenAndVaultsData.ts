import {
  Address,
  Chain,
  PublicClient,
  createPublicClient,
  getAddress,
  http,
  zeroAddress,
} from "viem";
import axios from "axios";
import { VaultAbi } from "@/lib/constants/abi/Vault";
import { LlamaApy, TokenByAddress, VaultData, VaultDataByAddress, VaultLabel } from "@/lib/types";
import { ChildGaugeAbi, ERC20Abi, GaugeAbi, OptionTokenByChain, VCX, VCX_LP, VeTokenByChain, XVCXByChain, ZapAssetAddressesByChain } from "@/lib/constants";
import { RPC_URLS } from "@/lib/utils/connectors";
import { YieldOptions } from "vaultcraft-sdk";
import { AavePoolUiAbi } from "@/lib/constants/abi/Aave";
import { GAUGE_NETWORKS } from "pages/boost";
import { AavePoolAddressProviderByChain, AaveUiPoolProviderByChain } from "@/lib/external/aave";
import getFraxlendApy from "@/lib/external/fraxlend/getFraxlendApy";
import { prepareAssets, prepareVaults, addBalances, prepareGauges } from "@/lib/tokens";
import getGaugesData from "@/lib/gauges/getGaugeData";
import { VE_VCX } from "./constants/addresses";
import { mainnet, xLayer } from "viem/chains";

const EMPTY_LLAMA_APY_ENTRY: LlamaApy = {
  apy: 0,
  apyBase: 0,
  apyReward: 0,
  date: new Date(),
}

interface GetVaultsByChainProps {
  chain: Chain;
  account?: Address;
  yieldOptions: YieldOptions;
}

export default async function getTokenAndVaultsDataByChain({
  chain,
  account = zeroAddress,
  yieldOptions,
}: GetVaultsByChainProps): Promise<{ vaultsData: VaultData[], tokens: TokenByAddress }> {
  const client = createPublicClient({
    chain,
    transport: http(RPC_URLS[chain.id]),
  });
  const chainId = chain.id;

  let vaultsData = await prepareVaultsData(chainId, client)
  vaultsData = await addStrategyData(vaultsData, chainId, client, yieldOptions)

  // Create token array
  const uniqueAssetAdresses: Address[] = [...ZapAssetAddressesByChain[chainId]];
  if (chainId === 1) uniqueAssetAdresses.push(...[VCX, VCX_LP, VE_VCX])
  if (GAUGE_NETWORKS.includes(chainId)) uniqueAssetAdresses.push(...[OptionTokenByChain[chainId], VeTokenByChain[chainId], XVCXByChain[chainId]])


  // Add vault assets
  Object.values(vaultsData).forEach((vault) => {
    if (!uniqueAssetAdresses.includes(vault.asset)) {
      uniqueAssetAdresses.push(vault.asset);
    }
  });


  // Add aave assets
  if (chainId !== xLayer.id) {
    const reserveData = await client.readContract({
      address: AaveUiPoolProviderByChain[chainId],
      abi: AavePoolUiAbi,
      functionName: 'getReservesData',
      args: [AavePoolAddressProviderByChain[chainId]],
    })
    reserveData[0].filter((d: any) => !d.isFrozen && !uniqueAssetAdresses.includes(d.underlyingAsset))
      .forEach((d: any) => uniqueAssetAdresses.push(d.underlyingAsset))
  }

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
    vaultsData = await addGaugeData(vaultsData, tokens, account, chainId)
  }

  return { vaultsData: Object.values(vaultsData), tokens };
}

async function prepareVaultsData(chainId: number, client: PublicClient): Promise<VaultDataByAddress> {
  const { data: allVaults } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/${chainId}.json`
  );

  const { data: hiddenVaults } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/hidden/${chainId}.json`
  );

  const filteredVaults = Object.values(allVaults)
    .filter((vault: any) => !hiddenVaults.includes(vault.address))
    .filter((vault: any) => vault.type !== "single-asset-lock-vault-v1")

  // @ts-ignore
  const dynamicValues = await client.multicall({
    contracts: filteredVaults
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
        ]
      })
      .flat(),
    allowFailure: false,
  });

  const apyHistAll = await Promise.all(filteredVaults.map(async (vault: any) => {
    if (vault.apyId.length > 0) return getApy(vault.apyId)
    return []
  }))

  let result: VaultDataByAddress = {};
  filteredVaults.forEach((vault: any, i: number) => {
    const apyHist = apyHistAll[i]
    if (i > 0) i = i * 3;

    const totalAssets = Number(dynamicValues[i])
    const totalSupply = Number(dynamicValues[i + 1])
    const assetsPerShare =
      totalSupply > 0 ? (totalAssets + 1) / (totalSupply + 1e9) : Number(1e-9);

    result[getAddress(vault.address)] = {
      address: getAddress(vault.address),
      vault: getAddress(vault.address),
      asset: getAddress(vault.assetAddress),
      gauge: getAddress(vault.gauge || zeroAddress),
      chainId: vault.chainId,
      fees: vault.fees,
      totalAssets: totalAssets,
      totalSupply: totalSupply,
      assetsPerShare: assetsPerShare,
      depositLimit: Number(dynamicValues[i + 2]),
      tvl: 0,
      apy: 0,
      totalApy: 0,
      apyHist: apyHist,
      apyId: vault.apyId,
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
      })
    }
  })

  return result
}

async function getCustomApy(address: Address, apyId: string, chainId: number): Promise<LlamaApy[]> {
  switch (apyId) {
    case "fraxlend":
      return getFraxlendApy(address, chainId);
    default:
      return [EMPTY_LLAMA_APY_ENTRY]
  }
}

async function getApy(apyId: string): Promise<LlamaApy[]> {
  try {
    const { data } = await axios.get(`https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/yields/chart/${apyId}`)
    return data.data.map((entry: any) => { return { apy: entry.apy, apyBase: entry.apyBase, apyReward: entry.apyReward, date: new Date(entry.timestamp) } })
  } catch (e) {
    console.log("ERROR FETCHING APY ", + apyId)
    console.log(e)
    return [EMPTY_LLAMA_APY_ENTRY]
  }
}

export async function addStrategyData(vaults: VaultDataByAddress, chainId: number, client: PublicClient, yieldOptions: YieldOptions): Promise<VaultDataByAddress> {
  const uniqueStrategyAdresses: Address[] = [];
  Object.values(vaults).forEach((vault) => {
    vault.strategies.forEach((strategy: any) => {
      if (!uniqueStrategyAdresses.includes(strategy.address)) {
        uniqueStrategyAdresses.push(strategy.address);
      }
    })
  });

  // Get TotalAssets and TotalSupply
  const taAndTs = await client.multicall({
    contracts: uniqueStrategyAdresses
      .map((address: Address) => {
        return [
          {
            address: address,
            abi: VaultAbi,
            functionName: "totalAssets"
          },
          {
            address: address,
            abi: VaultAbi,
            functionName: "totalSupply"
          }]
      })
      .flat(),
    allowFailure: false,
  });

  const { data: strategyDescriptions } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/descriptions/strategies/${chainId}.json`
  );

  let strategies: { [key: Address]: any } = {}

  await Promise.all(
    // We use map here since Promise.all doesnt work on a forEach
    uniqueStrategyAdresses.map(async (address, i) => {
      if (i > 0) i = i * 2;

      const totalAssets = Number(taAndTs[i]);
      const totalSupply = Number(taAndTs[i + 1]);
      const assetsPerShare =
        totalSupply > 0 ? (totalAssets + 1) / (totalSupply + 1e9) : Number(1e-9);

      const desc = strategyDescriptions[address]
      let apy = 0;
      let apyHist: LlamaApy[] = []
      let strategyApy
      try {
        strategyApy = desc.apySource === "custom" ? await getCustomApy(address, desc.apyId, chainId) : await getApy(desc.apyId)
        apy = strategyApy[strategyApy.length - 1].apy;
        apyHist = strategyApy;
      } catch (e) {
        console.log(strategyApy)
        console.log(`ERROR FETCHING APY: ${address}`)
        console.log(e)
      }

      strategies[address] = {
        totalAssets,
        totalSupply,
        assetsPerShare,
        asset: desc.asset,
        name: desc.name,
        description: desc.description.split("** - ")[1],
        resolver: desc.resolver,
        apy,
        apyHist,
        apyId: desc.apyId,
        apySource: desc.apySource
      }
    }))

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
    let apy = 0;

    vaults[address].strategies.forEach((strategy: any, i: number) => {
      const strategyData = strategies[strategy.address]

      // calc allocation in assets
      const allocation = Number(strategyBalances[n]) * strategyData.assetsPerShare

      // calc allocation percentage
      const allocationPerc = (allocation / vaults[address].totalAssets) || 0

      // add strategy metadata
      vaults[address].strategies[i] = {
        address: strategy.address,
        metadata: {
          name: strategyData.name,
          description: strategyData.description,
        },
        resolver: strategyData.resolver,
        allocation: allocation,
        allocationPerc: allocationPerc,
        apy: strategyData.apy,
        apyHist: strategyData.apyHist,
        apyId: strategyData.apyId,
        apySource: strategyData.apySource
      }

      // calc blended apy of the vault
      if (vaults[address].totalSupply === 0) {
        // Assume even allocation if the vault doesnt have allocations yet
        apy += strategyData.apy * (1 / vaults[address].strategies.length)
      } else {
        apy += strategyData.apy * allocationPerc
      }

      n += 1
    })

    // assign apy
    vaults[address].apy = apy;
    vaults[address].totalApy = apy;
  })

  return vaults
}

async function addGaugeData(vaultsData: VaultDataByAddress, tokens: TokenByAddress, account: Address, chainId: number): Promise<VaultDataByAddress> {
  const gaugesData = await getGaugesData({ vaultsData, tokens, account, chainId });

  gaugesData.forEach(gaugeData => {
    const vault = vaultsData[gaugeData.vault]

    if (vault) {
      vault.totalApy += gaugeData.upperAPR + gaugeData.rewardApy.apy || 0;
      vault.gaugeData = gaugeData;

      vaultsData[vault.address] = vault;
    }
  });

  return vaultsData;
}