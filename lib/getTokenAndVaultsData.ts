import {
  Address,
  Chain,
  createPublicClient,
  http,
  zeroAddress,
} from "viem";
import { PublicClient, erc20ABI, mainnet } from "wagmi";
import axios from "axios";
import { VaultAbi } from "@/lib/constants/abi/Vault";
import { GaugeData, Strategy, Token, TokenByAddress, TokenType, VaultData, VaultDataByAddress, VaultLabel } from "@/lib/types";
import { ERC20Abi, GaugeAbi, OptionTokenByChain, VCX, VCX_LP, VeTokenByChain, XVCXByChain, ZapAssetAddressesByChain } from "@/lib/constants";
import { RPC_URLS, networkMap } from "@/lib/utils/connectors";
import { ProtocolName, YieldOptions } from "vaultcraft-sdk";
import { AavePoolUiAbi } from "@/lib/constants/abi/Aave";
import { GAUGE_NETWORKS } from "pages/boost";
import { AavePoolAddressProviderByChain, AaveUiPoolProviderByChain } from "@/lib/external/aave";
import { vcx as getVcxPrice } from "@/lib/resolver/price/resolver";

const STRATEGY_TO_ALTERNATE_ASSET: { [key: Address]: Address } = {
  "0x9E0c5d524dc3Ff0aa734c52aa57ab623436364e6": "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
  "0xA84397004Abe8229CC481cE91BA850ECd8204822": "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7"
}

interface GetVaultsByChainProps {
  chain: Chain;
  account?: Address;
  yieldOptions: YieldOptions;
}

export default async function getTokenAndVaultsDataByChain({
  chain,
  account,
  yieldOptions,
}: GetVaultsByChainProps): Promise<{ vaultsData: VaultData[], tokens: TokenByAddress }> {
  const client = createPublicClient({
    chain,
    transport: http(RPC_URLS[chain.id]),
  });
  return getTokenAndVaultsData({ account, client, yieldOptions });
}

interface GetVaultsProps {
  account?: Address;
  client: PublicClient;
  yieldOptions: YieldOptions;
}

export async function getTokenAndVaultsData({
  account = zeroAddress,
  client,
  yieldOptions,
}: GetVaultsProps): Promise<{ vaultsData: VaultData[], tokens: TokenByAddress }> {
  const chainId = client.chain.id;

  let vaultsData = await prepareVaultsData(chainId, client)
  vaultsData = await addStrategyData(vaultsData, chainId, client, yieldOptions)

  // Create token array
  const uniqueAssetAdresses: Address[] = [...ZapAssetAddressesByChain[chainId]];
  if (chainId === 1) uniqueAssetAdresses.push(...[VCX, VCX_LP])
  if (GAUGE_NETWORKS.includes(chainId)) uniqueAssetAdresses.push(...[OptionTokenByChain[chainId], VeTokenByChain[chainId], XVCXByChain[chainId]])


  // Add vault assets
  Object.values(vaultsData).forEach((vault) => {
    if (!uniqueAssetAdresses.includes(vault.asset)) {
      uniqueAssetAdresses.push(vault.asset);
    }
  });

  // Add aave assets
  const reserveData = await client.readContract({
    address: AaveUiPoolProviderByChain[chainId],
    abi: AavePoolUiAbi,
    functionName: 'getReservesData',
    args: [AavePoolAddressProviderByChain[chainId]],
  })
  reserveData[0].filter(d => !d.isFrozen && !uniqueAssetAdresses.includes(d.underlyingAsset))
    .forEach(d => uniqueAssetAdresses.push(d.underlyingAsset))

  const assets = await prepareAssets(uniqueAssetAdresses, chainId, client);

  const vaults = await prepareVaults(vaultsData, assets, chainId)

  // calc vault tvl
  Object.values(vaultsData).forEach(vault => {
    vault.tvl = (vault.totalAssets * assets[vault.asset].price) / (10 ** assets[vault.asset].decimals);
  });

  const gaugeTokens: TokenByAddress = {}

  // Add gauges
  if (GAUGE_NETWORKS.includes(client.chain.id)) {

    const gauges = (
      await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/gauge-apy-data.json`
      )
    ).data as GaugeData;

    await Promise.all(
      Object.values(vaultsData).map(async (vault, i) => {
        const foundGauge = Object.values(gauges).find(
          (gauge) => gauge.vault === vault.address
        );

        if (!!foundGauge) {
          vault.gauge = foundGauge.address;
          vault.minGaugeApy = gauges[foundGauge.address]?.lowerAPR || 0;
          vault.maxGaugeApy = gauges[foundGauge.address]?.upperAPR || 0;
          vault.totalApy += gauges[foundGauge.address]?.upperAPR || 0;

          const boostRes = await client.multicall({
            contracts: [{
              address: foundGauge.address,
              abi: GaugeAbi,
              functionName: "totalSupply"
            },
            {
              address: foundGauge.address,
              abi: GaugeAbi,
              functionName: "working_supply"
            },
            {
              address: foundGauge.address,
              abi: GaugeAbi,
              functionName: "working_balances",
              args: [account]
            }],
            allowFailure: false
          })

          vaultsData[vault.address].gaugeSupply = Number(boostRes[0])
          vaultsData[vault.address].workingSupply = Number(boostRes[1])
          vaultsData[vault.address].workingBalance = Number(boostRes[2])

          // Add gauge to tokens
          gaugeTokens[foundGauge.address] = {
            address: foundGauge.address,
            name: `${vaults[vault.address].name}-gauge`,
            symbol: `st-${vaults[vault.address].symbol}`,
            decimals: vaults[vault.address].decimals,
            logoURI: "/images/tokens/vcx.svg", // wont be used, just here for consistency
            balance: 0,
            totalSupply: Number(boostRes[0]),
            price: vaults[vault.address].price,
            chainId: vault.chainId,
            type: TokenType.Gauge
          }
        }
      })
    );
  }

  let tokens = { ...assets, ...vaults, ...gaugeTokens }
  if (account !== zeroAddress) {
    tokens = await addBalances(tokens, account, client)
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

  let result: VaultDataByAddress = {};
  filteredVaults.forEach((vault: any, i: number) => {
    if (i > 0) i = i * 3;

    result[vault.address] = {
      address: vault.address,
      vault: vault.address,
      asset: vault.assetAddress,
      gauge: undefined,
      chainId: vault.chainId,
      fees: vault.fees,
      totalAssets: Number(dynamicValues[i]),
      totalSupply: Number(dynamicValues[i + 1]),
      depositLimit: Number(dynamicValues[i + 2]),
      tvl: 0,
      apy: 0,
      totalApy: 0,
      minGaugeApy: 0,
      maxGaugeApy: 0,
      gaugeSupply: 0,
      workingSupply: 0,
      workingBalance: 0,
      metadata: {
        vaultName: vault.name ? vault.name : undefined,
        labels: vault.labels
          ? vault.labels.map((label: string) => <VaultLabel>label)
          : undefined,
        description: vault.description || undefined,
        type: vault.type,
        creator: vault.creator,
        feeRecipient: vault.feeRecipient,
      },
      strategies: vault.strategies.map((strategy: Address) => {
        return {
          address: strategy,
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

async function prepareAssets(addresses: Address[], chainId: number, client: PublicClient): Promise<TokenByAddress> {
  const { data: assets } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/assets/tokens/${chainId}.json`
  );

  const { data: priceData } = await axios.get(
    `https://coins.llama.fi/prices/current/${String(
      addresses.map(
        (address) => `${networkMap[chainId].toLowerCase()}:${address}`
      )
    )}`
  );

  const vcxPrice = await getVcxPrice({ address: VCX, chainId: mainnet.id, client: undefined })

  const ts = await client.multicall({
    contracts: addresses
      .map((address: Address) => {
        return {
          address: address,
          abi: erc20ABI,
          functionName: "totalSupply"
        }
      })
      .flat(),
    allowFailure: false,
  });


  let result: TokenByAddress = {}
  addresses.forEach((address, i) => {
    let tokenPrice = Number(priceData.coins[`${networkMap[chainId].toLowerCase()}:${address}`]?.price) || 0

    if (address === VCX) {
      tokenPrice = vcxPrice
    } else if (address === OptionTokenByChain[chainId]) {
      tokenPrice = vcxPrice * 0.25
    }

    result[address] = {
      ...assets[address],
      price: tokenPrice,
      balance: 0,
      totalSupply: Number(ts[i]),
      chainId: chainId,
      type: TokenType.Asset
    }
  })

  return result;
}

async function prepareVaults(vaultsData: VaultDataByAddress, assets: TokenByAddress, chainId: number): Promise<TokenByAddress> {
  const { data: vaultTokens } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/tokens/${chainId}.json`
  );

  let result: TokenByAddress = {}
  Object.values(vaultsData).forEach(vault => {
    const assetsPerShare =
      vault.totalSupply > 0 ? (vault.totalAssets + 1) / (vault.totalSupply + 1e9) : Number(1e-9);
    const price = (assetsPerShare * assets[vault.asset].price) * 1e9; // @dev normalize vault price for previews (watch this if errors occur)

    result[vault.address] = {
      ...vaultTokens[vault.address],
      price,
      balance: 0,
      totalSupply: vault.totalSupply,
      chainId: chainId,
      type: TokenType.Vault
    }
  })

  return result;
}

async function getApy(strategy: Strategy) {
  const { data } = await axios.get(`https://yields.llama.fi/chart/${strategy.apyId}`)
  return data.data.map((entry: any) => { return { apy: entry.apy, apyBase: entry.apyBase, apyReward: entry.apyReward, date: new Date(entry.timestamp) } })
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
      let apyHist = []

      let assetAddress = desc.asset
      if (Object.keys(STRATEGY_TO_ALTERNATE_ASSET).includes(address)) {
        assetAddress = STRATEGY_TO_ALTERNATE_ASSET[address]
      }

      try {
        const strategyApy = await getApy(desc)
        apy = strategyApy[strategyApy.length - 1].apy;
        apyHist = strategyApy;
      } catch (e) {

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
      const allocationPerc = allocation / vaults[address].totalAssets

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
      apy += strategyData.apy * allocationPerc

      n += 1
    })

    // assign apy
    vaults[address].apy = apy;
    vaults[address].totalApy = apy;
  })

  return vaults
}


async function addBalances(tokens: TokenByAddress, account: Address, client: PublicClient): Promise<TokenByAddress> {
  const balances = await client.multicall({
    contracts:
      Object.values(tokens)
        .map((token: Token) => {
          return {
            address: token.address,
            abi: ERC20Abi,
            functionName: "balanceOf",
            args: [account]
          }
        })
        .flat(),
    allowFailure: false
  })

  Object.values(tokens).forEach((token: Token, i: number) => {
    token.balance = Number(balances[i])
  })

  return tokens
}