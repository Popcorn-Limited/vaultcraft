import {
  Address,
  Chain,
  ReadContractParameters,
  createPublicClient,
  getAddress,
  http,
  maxUint256,
  validateTypedData,
  zeroAddress,
} from "viem";
import { PublicClient } from "wagmi";
import axios from "axios";
import { VaultAbi } from "@/lib/constants/abi/Vault";
import { GaugeData, Token, VaultData, VaultLabel } from "@/lib/types";
import { ADDRESS_ZERO, ERC20Abi, getVeAddresses, zapAssetAddressesByChain } from "@/lib/constants";
import { RPC_URLS, networkMap } from "@/lib/utils/connectors";
import getGauges, { Gauge } from "@/lib/gauges/getGauges";
import { ProtocolName, YieldOptions } from "vaultcraft-sdk";

const HIDDEN_VAULTS: Address[] = [
  "0xb6cED1C0e5d26B815c3881038B88C829f39CE949",
  "0x2fD2C18f79F93eF299B20B681Ab2a61f5F28A6fF",
  "0xDFf04Efb38465369fd1A2E8B40C364c22FfEA340",
  "0xd4D442AC311d918272911691021E6073F620eb07", //@dev for some reason the live 3Crypto yVault isnt picked up by the yearnAdapter nor the yearnFactoryAdapter
  "0x8bd3D95Ec173380AD546a4Bd936B9e8eCb642de1", // Sample Stargate Vault
  "0xcBb5A4a829bC086d062e4af8Eba69138aa61d567", // yOhmFrax factory
  "0x9E237F8A3319b47934468e0b74F0D5219a967aB8", // yABoosted Balancer
  "0x860b717B360378E44A241b23d8e8e171E0120fF0", // R/Dai
  "0xBae30fBD558A35f147FDBaeDbFF011557d3C8bd2", // 50OHM - 50 DAI
  "0xa6fcC7813d9D394775601aD99874c9f8e95BAd78", // Automated Pool Token - Oracle Vault 3
];

const { GaugeController: GAUGE_CONTROLLER } = getVeAddresses();


interface GetVaultsByChainProps {
  chain: Chain;
  account?: Address;
  yieldOptions: YieldOptions;
}

export default async function getTokenAndVaultsDataByChain({
  chain,
  account,
  yieldOptions,
}: GetVaultsByChainProps): Promise<{ vaultsData: VaultData[], tokens: { [key: Address]: Token } }> {
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
}: GetVaultsProps): Promise<{ vaultsData: VaultData[], tokens: { [key: Address]: Token } }> {
  const chainId = client.chain.id;

  let vaultsData = await prepareVaultsData(chainId, client)
  vaultsData = await addStrategyData(vaultsData, chainId, client, yieldOptions)

  const uniqueAssetAdresses: Address[] = zapAssetAddressesByChain[chainId];
  Object.values(vaultsData).forEach((vault) => {
    if (!uniqueAssetAdresses.includes(vault.asset.address)) {
      uniqueAssetAdresses.push(vault.asset.address);
    }
  });
  const assets = await prepareAssets(uniqueAssetAdresses, chainId);

  const vaults = await prepareVaults(vaultsData, assets, chainId)

  // calc vault tvl
  Object.values(vaultsData).forEach(vault => {
    vault.tvl = (vault.totalSupply * vaults[vault.address].price) / (10 ** assets[vault.asset].decimals);
  });

  const gaugeTokens: { [key: Address]: Token } = {}
  // Add gauges
  if (client.chain.id === 1) {
    const gauges = await getGauges({
      address: GAUGE_CONTROLLER,
      account: account,
      publicClient: client,
    });
    const gaugeApyData = (
      await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/gauge-apy-data.json`
      )
    ).data as GaugeData;
    await Promise.all(
      Object.values(vaultsData).map(async (vault, i) => {
        const foundGauge = gauges.find(
          (gauge: Gauge) => gauge.lpToken === vault.address
        );
        if (!!foundGauge) {
          // Add gauge to tokens
          gaugeTokens[foundGauge.address] = {
            address: foundGauge.address,
            name: `${vault.vault.name}-gauge`,
            symbol: `st-${vault.vault.name}`,
            decimals: foundGauge.decimals,
            logoURI: "/images/tokens/vcx.svg", // wont be used, just here for consistency
            balance: 0,
            price: vaults[vault.address].price,
          }

          vault.gauge = foundGauge.address;
          vault.boostMin = gaugeApyData[foundGauge.address]?.lowerAPR || 0;;
          vault.boostMax = gaugeApyData[foundGauge.address]?.upperAPR || 0;;
          vault.totalApy += gaugeApyData[foundGauge.address]?.upperAPR || 0;;
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

async function prepareVaultsData(chainId: number, client: PublicClient): Promise<{ [key: Address]: any }> {
  const { data: allVaults } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/${chainId}.json`
  );

  const filteredVaults = Object.values(allVaults)
    .filter((vault: any) => !HIDDEN_VAULTS.includes(vault.address))
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

  let result: { [key: Address]: any } = {};
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
      boostMin: 0,
      boostMax: 0,
      metadata: {
        vaultName: vault.name ? vault.name : undefined,
        creator: vault.creator,
        feeRecipient: vault.feeRecipient,
        labels: vault.labels
          ? vault.labels.map((label: string) => <VaultLabel>label)
          : undefined,
        description: vault.description || undefined,
        type: vault.type,
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

async function prepareAssets(addresses: Address[], chainId: number): Promise<{ [key: Address]: Token }> {
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
  let result: { [key: Address]: Token } = {}
  addresses.forEach(address => {
    result[address] = {
      ...assets[address],
      price: Number(priceData.coins[`${networkMap[chainId].toLowerCase()}:${address}`]?.price),
      balance: 0
    }
  })

  return result;
}

async function prepareVaults(vaultsData: { [key: Address]: any }, assets: { [key: Address]: Token }, chainId: number): Promise<{ [key: Address]: Token }> {
  const { data: vaultTokens } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/tokens/${chainId}.json`
  );

  let result: { [key: Address]: Token } = {}
  Object.values(vaultsData).forEach(vault => {
    const assetsPerShare =
      vault.totalSupply > 0 ? (vault.totalAssets + 1) / (vault.totalSupply + 1e9) : Number(1e-9);
    const price = (assetsPerShare * assets[vault.asset].price) * 1e9; // @dev normalize vault price for previews (watch this if errors occur)

    result[vault.address] = {
      ...vaultTokens[vault.address],
      price,
      balance: 0
    }
  })

  return result;
}

async function addStrategyData(vaults: { [key: Address]: any }, chainId: number, client: PublicClient, yieldOptions: YieldOptions): Promise<{ [key: Address]: any }> {
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
      try {
        const vaultYield = await yieldOptions.getApy({
          chainId: chainId,
          protocol: desc.resolver as ProtocolName,
          asset: desc.asset,
        });
        apy = vaultYield.total;
      } catch (e) { }

      strategies[address] = {
        totalAssets,
        totalSupply,
        assetsPerShare,
        asset: desc.asset,
        name: desc.name,
        description: desc.description,
        resolver: desc.resolver,
        apy
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

    vaults[address].strategies.forEach((strategy: any) => {
      const strategyData = strategies[strategy.address]

      // calc allocation in assets
      const allocation = Number(strategyBalances[n]) * strategyData.assetsPerShare

      // calc allocation percentage
      const allocationPerc = allocation / vaults[address].totalAssets

      // add strategy metadata
      strategy = {
        address: strategy.address,
        metadata: {
          name: strategyData.name,
          description: strategyData.description,
        },
        resolver: strategyData.resolver,
        allocation: allocation,
        allocationPerc: allocationPerc,
        apy: strategyData.apy
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


async function addBalances(tokens: { [key: Address]: Token }, account: Address, client: PublicClient): Promise<{ [key: Address]: Token }> {
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