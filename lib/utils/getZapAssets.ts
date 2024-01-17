import { Token } from "@/lib/types";
import { Address, Chain, createPublicClient, http } from "viem";
import axios from "axios";
import { RPC_URLS, networkMap } from "@/lib/utils/connectors";
import { ERC20Abi, zapAssetAddressesByChain } from "@/lib/constants";

export default async function getZapAssets({ chain, account }: { chain: Chain, account?: Address }): Promise<Token[]> {
  const { data: assets } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/assets/tokens/${chain.id}.json`)
  const selected: Token[] = Object.values(assets).filter((asset: any) => zapAssetAddressesByChain[chain.id].includes(asset.address)).map(asset => { return { ...(asset as Token), balance: 0 } })
  if (selected.length === 0) return []
  // Add prices
  const { data } = await axios.get(`https://coins.llama.fi/prices/current/${String(selected.map(asset => `${networkMap[chain.id].toLowerCase()}:${asset.address}`))}`)

  let balances: bigint[];
  if (account) {
    const client = createPublicClient({ chain, transport: http(RPC_URLS[chain.id]) })
    balances = await client.multicall({
      contracts: selected.map(asset => {
        return {
          address: asset.address,
          abi: ERC20Abi,
          functionName: 'balanceOf',
          args: [account]
        }
      }),
      allowFailure: false
    })
  }

  return selected.map((asset, i) => {
    const address = asset.address
    const key = `${networkMap[chain.id].toLowerCase()}:${address}`
    const price = Number(data.coins[key]?.price || 0)
    return {
      address,
      name: asset.name,
      symbol: asset.symbol,
      decimals: asset.decimals,
      logoURI: asset.logoURI,
      balance: account ? Number(balances[i]) : 0,
      price
    }
  })
}

export async function getAvailableZapAssets(chainId: number) {
  const { data } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/assets/zapAddresses/${chainId}.json`)
  return data
}