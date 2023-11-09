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

export async function getVaultsByChain({ chain, account }: { chain: Chain, account?: Address }): Promise<VaultData[]> {
  const client = createPublicClient({ chain, transport: http(RPC_URLS[chain.id]) })
  const vaults = await getVaultAddresses({ client })
  return getVaults({ vaults, account, client })
}

export async function getVaults({ vaults, account = ADDRESS_ZERO, client }: { vaults: Address[], account?: Address, client: PublicClient }): Promise<VaultData[]> {
  const hasAccount = account !== ADDRESS_ZERO
  // Get vault addresses
  const results = await client.multicall({
    contracts: vaults.map(vault => prepareVaultContract(vault, account)).flat(),
    allowFailure: false
  })

  // Add core metadata
  let metadata = vaults.map((vault, i) => {
    if (i > 0) i = i * 10
    const assetsPerShare = Number(results[i + 6]) > 0 ? Number(results[i + 5]) / Number(results[i + 6]) : Number(1e-9)
    const fees = results[i + 7] as [BigInt, BigInt, BigInt, BigInt]
    return {
      address: getAddress(vault),
      vault: {
        address: getAddress(vault),
        name: String(results[i + 0]),
        symbol: String(results[i + 1]),
        decimals: Number(results[i + 2]),
        logoURI: "/images/tokens/pop.svg",
        balance: hasAccount ? Number(results[i + 9]) : 0
      },
      assetAddress: getAddress(results[i + 3] as string),
      adapterAddress: getAddress(results[i + 4] as string),
      totalAssets: Number(results[i + 5]),
      totalSupply: Number(results[i + 6]),
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

  // Add prices
  const { data } = await axios.get(`https://coins.llama.fi/prices/current/${String(metadata.map(
    // @ts-ignore -- @dev ts still thinks entry.asset is just an `Address`
    entry => `${networkMap[client.chain.id].toLowerCase()}:${entry.asset.address}`
  ))}`)
  metadata = metadata.map((entry, i) => {
    const key = `${networkMap[client.chain.id].toLowerCase()}:${entry.asset.address}`
    const assetPrice = Number(data.coins[key]?.price || 0)
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
  // Add gauges
  if (client.chain.id === 1) {
    const gauges = await getGauges({ address: GAUGE_CONTROLLER, account: account, publicClient: client })
    metadata = metadata.map((entry, i) => {
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

      return {
        ...entry,
        gauge
      }
    })
  }

  return metadata as unknown as VaultData[]
}


export async function getVault({ vault, account = ADDRESS_ZERO, client }: { vault: Address, account?: Address, client: PublicClient }): Promise<VaultData> {
  const hasAccount = account !== ADDRESS_ZERO

  const results = await client.multicall({
    contracts: prepareVaultContract(vault, account),
    allowFailure: false
  })
  const registryMetadata = await client.readContract(prepareRegistryContract(VaultRegistryByChain[client.chain.id], vault)) as unknown as string[]
  const vaultName = await getVaultName({ address: getAddress(vault), cid: registryMetadata[3] })

  const price = await resolvePrice({ chainId: client.chain.id, client: client, address: results[3] as Address, resolver: 'llama' })
  const assetsPerShare = Number(results[6]) > 0 ? Number(results[5]) / Number(results[6]) : Number(1e-9)
  const pricePerShare = assetsPerShare * price
  const fees = results[7] as [BigInt, BigInt, BigInt, BigInt]

  // Add token and adapter metadata
  const assetAndAdapterMeta = await client.multicall({
    contracts: [...prepareTokenContracts(results[3] as Address, account), ...prepareTokenContracts(results[4] as Address, account)].flat(),
    allowFailure: false
  })
  const asset = {
    address: getAddress(results[3] as string),
    name: String(assetAndAdapterMeta[0]),
    symbol: String(assetAndAdapterMeta[1]),
    decimals: Number(results[2]) - 9,
    logoURI: "",
    balance: hasAccount ? Number(assetAndAdapterMeta[2]) : 0,
    price: price
  }
  const adapter = {
    address: getAddress(results[4] as string),
    name: String(assetAndAdapterMeta[3]),
    symbol: String(assetAndAdapterMeta[4]),
    decimals: Number(results[2]),
    logoURI: "/images/tokens/pop.svg", // wont be used, just here for consistency,
    balance: 0, // wont be used, just here for consistency,
    price: 0, // wont be used, just here for consistency,
  }
  const result = {
    address: getAddress(vault),
    vault: {
      address: getAddress(vault),
      name: String(results[0]),
      symbol: String(results[1]),
      decimals: Number(results[2]),
      logoURI: "/images/tokens/pop.svg",
      balance: hasAccount ? Number(results[9]) : 0,
      price: pricePerShare * 1e9,  // @dev -- normalize vault price for previews (watch this if errors occur)
    },
    asset: { ...asset, logoURI: getAssetIcon({ asset, adapter, chainId: client.chain.id }) },
    adapter,
    totalAssets: Number(results[5]),
    totalSupply: Number(results[6]),
    assetsPerShare: assetsPerShare,
    assetPrice: price,
    pricePerShare: pricePerShare,
    tvl: (Number(results[6]) * pricePerShare) / (10 ** (Number(results[2]) - 9)),
    fees: {
      deposit: Number(fees[0]),
      withdrawal: Number(fees[1]),
      management: Number(fees[2]),
      performance: Number(fees[3]),
    },
    depositLimit: Number(results[8]),
    metadata: {
      creator: registryMetadata[2] as Address,
      cid: registryMetadata[3] as string,
      vaultName: vaultName,
      optionalMetadata: getOptionalMetadata({ vaultAddress: getAddress(vault), asset: asset, adapter: adapter })
    },
    chainId: client.chain.id
  }

  // Add gauges
  if (client.chain.id === 1) {
    const {
      GaugeController: GAUGE_CONTROLLER,
    } = getVeAddresses();
    const gauges = await getGauges({ address: GAUGE_CONTROLLER, publicClient: client })
    const foundGauge = gauges.find((gauge: Gauge) => gauge.lpToken === result.address)
    // @ts-ignore
    result.gauge = foundGauge ? {
      address: foundGauge.address,
      name: `${result.vault.name}-gauge`,
      symbol: `st-${result.vault.name}`,
      decimals: foundGauge.decimals,
      logoURI: "/images/tokens/pop.svg",  // wont be used, just here for consistency
      balance: foundGauge.balance,
      price: result.pricePerShare * 1e9,
    } : undefined
  }
  return result;
}