import axios from "axios";
import { Address, PublicClient, mainnet } from "wagmi";
import { ChainId, RPC_URLS, networkMap } from "@/lib/utils/connectors";
import { VaultAbi } from "@/lib/constants";
import getVaultAddresses from "@/lib/vault/getVaultAddresses";
import { Chain, createPublicClient, http } from "viem";
import { arbitrum, optimism, polygon } from "viem/chains";

function prepareContract(address: Address, account: Address) {
  const vaultContract = {
    address,
    abi: VaultAbi
  }
  return [{
    ...vaultContract,
    functionName: 'asset'
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
    functionName: 'balanceOf',
    args: [account]
  },
  {
    ...vaultContract,
    functionName: 'decimals'
  }]
}

async function getVaultValues({ addresses, account, client }: { addresses: Address[], account: Address, client: PublicClient }): Promise<any[]> {
  const res = await client.multicall({ contracts: addresses.map(address => prepareContract(address, account)).flat(), allowFailure: false })

  return addresses.map((address, i) => {
    if (i > 0) i = i * 5
    const assetsPerShare = Number(res[i + 1]) === 0 ? 0 : Number(res[i + 1]) / Number(res[i + 2])
    return {
      vault: address,
      asset: res[i] as Address,
      assetsPerShare: assetsPerShare,
      totalAssets: Number(res[i + 1]),
      totalSupply: Number(res[i + 2]),
      balance: Number(res[i + 3]),
      decimals: Number(res[i + 4])
    }
  })
}

export async function getVaultNetworthByChain({ account, chain }: { account: Address, chain: Chain }): Promise<number> {
  const client = createPublicClient({
    chain,
    transport: http(RPC_URLS[chain.id])
  })
  const addresses = await getVaultAddresses({ client })
  const vaultValues = await getVaultValues({ addresses, account, client })
  const { data } = await axios.get(`https://coins.llama.fi/prices/current/${String(vaultValues.map(entry => `${networkMap[chain.id].toLowerCase()}:${entry.asset}`))}`)
  const vaults = vaultValues.map((entry, i) => {
    const assetPrice = Number(data.coins[`${networkMap[chain.id].toLowerCase()}:${entry.asset}`]?.price || 0)
    return {
      ...entry,
      price: assetPrice * entry.assetsPerShare,
      balanceValue: entry.balance === 0 ? 0 : (entry.balance * assetPrice * entry.assetsPerShare) / (10 ** ((entry.decimals as number) - 9))
    }
  })

  return vaults.reduce((acc, entry) => acc + entry.balanceValue, 0)
}

type VaultNetworth = {
  [ChainId.Ethereum]: number,
  [ChainId.Polygon]: number,
  [ChainId.Optimism]: number,
  [ChainId.Arbitrum]: number,
  total: number
}

export default async function getVaultNetworth({ account }: { account: Address }): Promise<VaultNetworth> {
  const ethereumNetworth = await getVaultNetworthByChain({ account, chain: mainnet })
  const polygonNetworth = await getVaultNetworthByChain({ account, chain: polygon })
  const optimismNetworth = await getVaultNetworthByChain({ account, chain: optimism })
  const arbitrumNetworth = await getVaultNetworthByChain({ account, chain: arbitrum })

  return {
    [ChainId.Ethereum]: ethereumNetworth,
    [ChainId.Polygon]: polygonNetworth,
    [ChainId.Optimism]: optimismNetworth,
    [ChainId.Arbitrum]: arbitrumNetworth,
    total: ethereumNetworth + polygonNetworth + optimismNetworth + arbitrumNetworth
  }
}