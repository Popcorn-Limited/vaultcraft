import { Address, Chain, ReadContractParameters, createPublicClient, getAddress, http } from "viem"
import { PublicClient } from "wagmi"
import axios from "axios"
import { VaultAbi } from "@/lib/constants/abi/Vault"
import { resolvePrice } from "@/lib/resolver/price/price"
import { Token, VaultData } from "@/lib/types"
import { ADDRESS_ZERO, ERC20Abi, VaultRegistryByChain, VaultRegistyAbi } from "@/lib/constants"
import { RPC_URLS, networkMap } from "@/lib/utils/connectors";
import getVaultAddresses from "@/lib/vault/getVaultAddresses"
import getAssetIcon from "@/lib/vault/getAssetIcon"
import getVaultName from "@/lib/vault/getVaultName"
import getOptionalMetadata from "@/lib/vault/getOptionalMetadata"
import { getVeAddresses } from "../utils/addresses"
import getGauges, { Gauge } from "../gauges/getGauges"
import { cleanTokenName, cleanTokenSymbol } from "../utils/helpers"
import { ProtocolName, YieldOptions } from "vaultcraft-sdk"
import calculateAPR from "../gauges/calculateGaugeAPR"

const { GaugeController: GAUGE_CONTROLLER } = getVeAddresses();

function prepareVaultContract(vault: Address, account: Address): ReadContractParameters[] {
  const vaultContract = {
    address: vault,
    abi: VaultAbi
  }

  return [
    {
      ...vaultContract,
      functionName: 'name',
    },
    {
      ...vaultContract,
      functionName: 'symbol',
    },
    {
      ...vaultContract,
      functionName: 'decimals'
    },
    {
      ...vaultContract,
      functionName: 'asset'
    },
    {
      ...vaultContract,
      functionName: 'adapter'
    },
    {
      ...vaultContract,
      functionName: 'totalAssets'
    },
    {
      ...vaultContract,
      functionName: 'totalSupply'
    },
    {
      ...vaultContract,
      functionName: 'fees'
    },
    {
      ...vaultContract,
      functionName: 'depositLimit'
    },
    {
      ...vaultContract,
      functionName: 'balanceOf',
      args: [account]
    }
  ]
}

function prepareRegistryContract(address: Address, vault: Address): ReadContractParameters {
  const vaultRegisty = {
    address,
    abi: VaultRegistyAbi
  }

  return {
    ...vaultRegisty,
    functionName: 'metadata',
    args: [vault]
  }
}

function prepareTokenContracts(address: Address, account: Address): ReadContractParameters[] {
  const token = {
    address,
    abi: ERC20Abi
  }
  return [
    {
      ...token,
      functionName: 'name',
    },
    {
      ...token,
      functionName: 'symbol',
    },
    {
      ...token,
      functionName: 'balanceOf',
      args: [account]
    }
  ]
}

interface GetVaultsByChainProps {
  chain: Chain;
  account?: Address;
  yieldOptions: YieldOptions
}

export async function getVaultsByChain({ chain, account, yieldOptions }: GetVaultsByChainProps): Promise<VaultData[]> {
  const client = createPublicClient({ chain, transport: http(RPC_URLS[chain.id]) })
  const vaults = await getVaultAddresses({ client })
  return getVaults({ vaults, account, client, yieldOptions })
}

interface GetVaultsProps {
  vaults: Address[];
  account?: Address;
  client: PublicClient;
  yieldOptions: YieldOptions
}

export async function getVaults({ vaults, account = ADDRESS_ZERO, client, yieldOptions }: GetVaultsProps): Promise<VaultData[]> {
  const hasAccount = account !== ADDRESS_ZERO
  // Get vault addresses
  const results = await client.multicall({
    contracts: vaults.map(vault => prepareVaultContract(vault, account)).flat(),
    allowFailure: false
  })

  // Add core metadata
  let metadata = vaults.map((vault, i) => {
    if (i > 0) i = i * 10
    const totalAssets = Number(results[i + 5]);
    const totalSupply = Number(results[i + 6])
    const assetsPerShare = Number(results[i + 6]) > 0 ? (totalAssets + 1) / (totalSupply + (1e9)) : Number(1e-9)
    const fees = results[i + 7] as [BigInt, BigInt, BigInt, BigInt]
    const vaultToken: Token = {
      address: getAddress(vault),
      name: String(results[i + 0]),
      symbol: String(results[i + 1]),
      decimals: Number(results[i + 2]),
      logoURI: "/images/tokens/pop.svg",
      balance: hasAccount ? Number(results[i + 9]) : 0,
      price: 0 // @dev will be added in a later step
    }
    return {
      address: getAddress(vault),
      vault: { ...vaultToken, symbol: cleanTokenSymbol(vaultToken) },
      assetAddress: getAddress(results[i + 3] as string),
      adapterAddress: getAddress(results[i + 4] as string),
      totalAssets: totalAssets,
      totalSupply: totalSupply,
      assetsPerShare: assetsPerShare,
      fees: {
        deposit: Number(fees[0]),
        withdrawal: Number(fees[1]),
        management: Number(fees[2]),
        performance: Number(fees[3]),
      },
      depositLimit: Number(results[i + 8]),
      chainId: client.chain.id
    }
  }) as any[]

  // Add token and adapter metadata
  const assetAndAdapterMeta = await client.multicall({
    contracts: metadata.map(data => [...prepareTokenContracts(data.assetAddress, account), ...prepareTokenContracts(data.adapterAddress, account)]).flat(),
    allowFailure: false
  })
  // @ts-ignore -- @dev ts doesnt like the type override from asset and adapter as `Address` to `Token`
  metadata = metadata.map((entry, i) => {
    if (i > 0) i = i * 6
    const asset = {
      address: getAddress(entry.assetAddress),
      name: String(assetAndAdapterMeta[i]),
      symbol: String(assetAndAdapterMeta[i + 1]),
      decimals: entry.vault.decimals - 9,
      logoURI: "",
      balance: hasAccount ? Number(assetAndAdapterMeta[i + 2]) : 0,
      price: 0,
    }
    const adapter = {
      address: getAddress(entry.adapterAddress),
      name: String(assetAndAdapterMeta[i + 3]),
      symbol: String(assetAndAdapterMeta[i + 4]),
      decimals: entry.vault.decimals,
      logoURI: "/images/tokens/pop.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
    }
    return {
      ...entry,
      asset: {
        ...asset,
        name: cleanTokenName(asset),
        symbol: cleanTokenSymbol(asset),
        logoURI: getAssetIcon({ asset, adapter, chainId: client.chain.id })
      },
      adapter
    }
  })

  // Add vaultName and metadata
  const registryMetadata = await client.multicall({
    contracts: vaults.map(vault => prepareRegistryContract(VaultRegistryByChain[client.chain.id], vault)).flat(),
    allowFailure: false
  }) as unknown as string[][]
  const vaultNames = await Promise.all(registryMetadata.map(async (data) => getVaultName({ address: getAddress(data[0]), cid: data[3] })))
  metadata = metadata.map((entry, i) => {
    return {
      ...entry,
      metadata: {
        creator: getAddress(registryMetadata[i][2]),
        cid: registryMetadata[i][3] as string,
        vaultName: vaultNames[i],
        optionalMetadata: getOptionalMetadata({ vaultAddress: entry.address, asset: entry.asset as Token, adapter: entry.adapter as Token })
      }
    }
  })

  console.log(`https://coins.llama.fi/prices/current/${String(metadata.map(
    // @ts-ignore -- @dev ts still thinks entry.asset is just an `Address`
    entry => `${networkMap[client.chain.id].toLowerCase()}:${entry.asset.address}`
  ))}`)

  // Add prices
  const { data: priceData } = await axios.get(`https://coins.llama.fi/prices/current/${String(metadata.map(
    // @ts-ignore -- @dev ts still thinks entry.asset is just an `Address`
    entry => `${networkMap[client.chain.id].toLowerCase()}:${entry.asset.address}`
  ))}`)

  const { data: beefyTokens } = await axios.get("https://api.beefy.finance/tokens")
  const { data: beefyPrices } = await axios.get("https://api.beefy.finance/lps")

  metadata = metadata.map((entry, i) => {
    const key = `${networkMap[client.chain.id].toLowerCase()}:${entry.asset.address}`
    let assetPrice = Number(priceData.coins[key]?.price || 10)
    if (assetPrice === 10 && client.chain.id === 10) {
      const lpFound: any | undefined = Object.entries(beefyTokens["optimism"]).map(entry => entry[1]).find((token: any) => getAddress(token.address) === getAddress(entry.asset.address))
      if (!lpFound) assetPrice = 1;
      const beefyKey = Object.keys(beefyPrices).find(key => key === lpFound.oracleId)
      // @ts-ignore
      assetPrice = beefyPrices[beefyKey]
    }
    const pricePerShare = entry.assetsPerShare * assetPrice
    return {
      ...entry,
      vault: { ...entry.vault, price: pricePerShare * 1e9 }, // @dev -- normalize vault price for previews (watch this if errors occur)
      asset: { ...entry.asset, price: assetPrice },
      assetPrice: assetPrice,
      pricePerShare: pricePerShare,
      // @ts-ignore -- @dev ts still thinks entry.asset is just an `Address`
      tvl: (entry.totalSupply * pricePerShare) / (10 ** entry.asset.decimals)
    }
  })

  // Add apy
  metadata = await Promise.all(metadata.map(async (entry, i) => {
    let apy = 0;
    try {
      const vaultYield = await yieldOptions.getApy({
        chainId: entry.chainId,
        protocol: entry.metadata.optionalMetadata.resolver as ProtocolName,
        asset: entry.asset.address
      })
      apy = vaultYield.total
    } catch (e) { }
    return { ...entry, apy, totalApy: apy }
  }))


  // Add gauges
  if (client.chain.id === 1) {
    const gauges = await getGauges({ address: GAUGE_CONTROLLER, account: account, publicClient: client })
    metadata = await Promise.all(metadata.map(async (entry, i) => {
      const foundGauge = gauges.find((gauge: Gauge) => gauge.lpToken === entry.address)
      const gauge = foundGauge ? {
        address: foundGauge.address,
        name: `${entry.vault.name}-gauge`,
        symbol: `st-${entry.vault.name}`,
        decimals: foundGauge.decimals,
        logoURI: "/images/tokens/pop.svg",  // wont be used, just here for consistency
        balance: foundGauge.balance,
        price: entry.pricePerShare * 1e9,
      } : undefined

      let gaugeMinApy;
      let gaugeMaxApy;
      let totalApy = entry.totalApy;
      if (!!gauge) {
        const gaugeApr = await calculateAPR({ vaultPrice: entry.vault.price, gauge: gauge.address, publicClient: client })
        gaugeMinApy = gaugeApr[0];
        gaugeMaxApy = gaugeApr[1];
        totalApy += gaugeApr[1];
      }

      return {
        ...entry,
        gauge,
        gaugeMinApy,
        gaugeMaxApy,
        totalApy
      }
    }))
  }

  return metadata as unknown as VaultData[]
}