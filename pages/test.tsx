import { RPC_URLS } from "@/lib/utils/connectors";
import { Address, createPublicClient, http } from "viem";
import { arbitrum, mainnet, optimism, polygon } from "viem/chains"
import axios from "axios";
import { ERC20Abi, VaultRegistryAbi, VaultRegistryByChain } from "@/lib/constants";


function getStargateMetadata(name: string) {
  return {
    protocol: ProtocolMetadata.stargate,
    token: { name: `STG-${asset.symbol.slice(2)}`, description: addLpMetadata("stargate", asset.symbol.slice(2)) },
    strategy: { name: "Stargate Compounding", description: addGenericStrategyDescription("lpCompounding", "Stargate") },
    getTokenUrl: `https://stargate.finance/pool/${asset.symbol.slice(2)}-ETH/add`,
    resolver: "stargate"
  }
}

function getConvexMetadata(name: string) {
  return {
    protocol: ProtocolMetadata.convex,
    token: { name: `STG-${asset.symbol.slice(2)}`, description: addLpMetadata("stableLp", "curve") },
    strategy: { name: "Convex Compounding", description: addGenericStrategyDescription("lpCompounding", "Convex") },
    getTokenUrl: `https://curve.fi/#/ethereum/pools`,
    resolver: "convex",
  }
}

function getAaveV2Metadata(name: string) {
  return {
    protocol: ProtocolMetadata.aave,
    token: { name: asset.symbol, description: "None available" },
    strategy: { name: "Aave Lending", description: addGenericStrategyDescription("lending", "Aave") },
    resolver: "aaveV3",
  }
}

function getAaveV3Metadata(name: string) {
  return {
    protocol: ProtocolMetadata.aave,
    token: { name: asset.symbol, description: "None available" },
    strategy: { name: "Aave Lending", description: addGenericStrategyDescription("lending", "Aave") },
    resolver: "aaveV3",
  }
}

function getAuraMetadata(name: string) {
  return {
    protocol: ProtocolMetadata.aura,
    token: { name: asset.symbol, description: "None available" },
    strategy: { name: "Aura Compounding", description: addGenericStrategyDescription("lpCompounding", "Aura") },
    resolver: "aura",
  }
}

function getCompoundV2Metadata(name: string) {
  return {
    protocol: ProtocolMetadata.compound,
    token: { name: asset.symbol, description: "None available" },
    strategy: { name: "Compound Lending", description: addGenericStrategyDescription("lending", "Compound") },
    resolver: "compoundV2",
  }
}

function getCompoundV3Metadata(name: string) {
  return {
    protocol: ProtocolMetadata.compound,
    token: { name: asset.symbol, description: "None available" },
    strategy: { name: "Compound Lending", description: addGenericStrategyDescription("lending", "Compound") },
    resolver: "compoundV3",
  }
}

function getFluxMetadata(name: string) {
  return {
    protocol: ProtocolMetadata.flux,
    token: { name: asset.symbol, description: "None available" },
    strategy: StrategyMetadata.fluxLending,
    resolver: "flux",
  }
}

function getBeefyMetadata(name: string) {
  return { name: "Beefy Vault", description: addGenericStrategyDescription("automatedAssetStrategy", "Beefy"), resolver: "beefy"}
}

function getYearnMetadata(name: string) {
  return { name: "Yearn Vault", description: addGenericStrategyDescription("automatedAssetStrategy", "Yearn"), resolver: "yearn" }
}

function getIdleMetadata(name: string) {
  return {
    ...name.includes("Senior") ?
      { name: "Senior Tranche", description: addGenericStrategyDescription("seniorTranche", "Idle") } :
      { name: "Junior Tranche", description: addGenericStrategyDescription("juniorTranche", "Idle") },
    resolver: name.includes("Senior") ? "idleSenior" : "idleJunior",
  }
}

function getOriginMetadata(name: string) {
  return { ...name.includes("Ether") ? StrategyMetadata.oeth : StrategyMetadata.ousd, resolver: "origin" }
}

function getPirexMetadata(name: string) {
  return { name: "Pirex Vault", description: addGenericStrategyDescription("automatedAssetStrategy", "Pirex"), resolver: "pirex" }
}

function getSommelierMetadata(name: string) {
  return { name: "Sommelier Vault", description: addGenericStrategyDescription("automatedAssetStrategy", "Sommelier"), resolver: "sommelier" }
}

function getEmptyMetadata(name: string) {
  return {
    token: { name: "Token", description: "Not found" },
    protocol: { name: "Protocol", description: "Not found" },
    strategy: { name: "Strategy", description: "Not found" },
  }
}

const EXCEPTIONS = {
  "0xE3267A9Ff2d38B748B6aA202e006F7d94Ca22df3": {
    name: "Sommelier Turbo",
    description: "Sommelier Turbo"
  }
}


function getFactoryMetadata({ address, name }: { address: Address, name: string }) {
  if (Object.keys(EXCEPTIONS).includes(address)) {
    return EXCEPTIONS[address]
  }
  switch (name) {
    case "Stargate":
      return getStargateMetadata(adapter, asset)
    case "Convex":
      return getConvexMetadata(adapter, asset)
    case "AaveV2":
      return getAaveV2Metadata(adapter, asset)
    case "AaveV3":
      return getAaveV3Metadata(adapter, asset)
    case "Aura":
      return getAuraMetadata(adapter, asset)
    case "CompoundV2":
      return getCompoundV2Metadata(adapter, asset)
    case "CompoundV3":
      return getCompoundV3Metadata(adapter, asset)
    case "Flux":
      return getFluxMetadata(adapter, asset)
    case "Beefy":
      return getBeefyMetadata(adapter, asset)
    case "Yearn":
      return getYearnMetadata(adapter, asset)
    case "Idle":
      return getIdleMetadata(adapter, asset)
    case "Origin":
      return getOriginMetadata(adapter, asset)
    case "Pirex":
      return getPirexMetadata(adapter, asset)
    default:
      return getEmptyMetadata(adapter, asset)
  }
}

const networksByChainId = {
  1: mainnet,
  137: polygon,
  10: optimism,
  42161: arbitrum
}

async function getStuffByChain(chainId: number) {
  const client = createPublicClient({
    chain: networksByChainId[chainId],
    transport: http(RPC_URLS[chainId]),
  });

  const { vaultData } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/${chainId}.json`)
  const { strategyData } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/descriptions/strategies/${chainId}.json`)

  const filteredStrategies = vaultData.map(vault => vault.strategies).flat().filter(strategy => !Object.keys(strategyData).includes(strategy))

  // if not in data -> fetch base data
  if (filteredStrategies.length > 0) {
    const names = await client.multicall({
      contracts: filteredStrategies.map(strategy => {
        return {
          address: strategy,
          abi: ERC20Abi,
          functionName: 'name',
        }
      }),
      allowFailure: false
    })

  }

  return data
}


const chains = [1, 137, 10, 42161]

async function main() {
  for (let i = 0; i < chains.length; i++) {
    const data = await getStuffByChain(chains[i])
    writeFileSync(`./archive/vaults/${chains[i]}.json`, JSON.stringify(data), "utf-8");
  }
}


export default function Test() {

}