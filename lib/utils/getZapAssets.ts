import { Token } from "@/lib/types";
import assets from "@/lib/constants/assets";
import { Address, Chain, createPublicClient, getAddress, http } from "viem";
import axios from "axios";
import { RPC_URLS, networkMap } from "@/lib/utils/connectors";
import { ERC20Abi } from "@/lib/constants";

const symbolsToSelect = ["DAI", "USDC", "USDC.e", "USDT", "LUSD", "WETH", "WBTC"]

export default async function getZapAssets({ chain, account }: { chain: Chain, account?: Address }): Promise<Token[]> {
  const selected = assets.filter(asset => asset.chains.includes(chain.id)).filter(asset => symbolsToSelect.includes(asset.symbol))
  if (selected.length === 0) return []
  // Add prices
  const { data } = await axios.get(`https://coins.llama.fi/prices/current/${String(selected.map(asset => `${networkMap[chain.id].toLowerCase()}:${asset.address[String(chain.id)]}`))}`)

  let balances: bigint[];
  if (account) {
    const client = createPublicClient({ chain, transport: http(RPC_URLS[chain.id]) })
    balances = await client.multicall({
      contracts: selected.map(asset => {
        return {
          address: asset.address[String(chain.id)],
          abi: ERC20Abi,
          functionName: 'balanceOf',
          args: [account]
        }
      }),
      allowFailure: false
    })
  }

  return selected.map((asset, i) => {
    const address = asset.address[String(chain.id)]
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
  const defiTokens = (await axios.get('https://enso-scrape.s3.us-east-2.amazonaws.com/output/backend/defiTokens.json')).data
    .filter((entry: any) => entry.chainId === chainId).map((entry: any) => getAddress(entry.tokenAddress))
  const baseTokens = (await axios.get('https://enso-scrape.s3.us-east-2.amazonaws.com/output/backend/baseTokens.json')).data
    .filter((entry: any) => entry.chainId === chainId).map((entry: any) => getAddress(entry.address))
  return [...baseTokens, ...defiTokens]
}