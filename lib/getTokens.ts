import { Token } from "@/lib/types";
import axios from "axios"
import { ERC20Abi, zapAssetAddressesByChain } from "@/lib/constants";
import { HIDDEN_VAULTS } from "@/lib/vault/getVaults";
import { Address, Chain, createPublicClient, http } from "viem";
import { RPC_URLS, networkMap } from "@/lib/utils/connectors";

export default async function getTokens({ chain, account }: { chain: Chain, account?: Address }): Promise<Token[]> {
  const chainId = chain.id

  const allVaults = Object.values((await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/${chainId}.json`)).data)
    .filter((vault: any) => vault.type === "single-asset-vault-v1" || vault.type === "multi-strategy-vault-v1")
    .filter((vault: any) => !HIDDEN_VAULTS.includes(vault.address))
  const { data: vaultTokens } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/tokens/${chainId}.json`)
  const { data: assets } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/assets/tokens/${chainId}.json`)

  const uniqueAdresses: Address[] = zapAssetAddressesByChain[chainId]
  Object.values(allVaults).forEach((vault: any) => {
    uniqueAdresses.push(vault.address)

    if (!uniqueAdresses.includes(vault.assetAddress)) {
      uniqueAdresses.push(vault.assetAddress)
    }
  })

  let balances: bigint[];
  if (account) {
    const client = createPublicClient({ chain, transport: http(RPC_URLS[chain.id]) })
    balances = await client.multicall({
      contracts: uniqueAdresses.map(address => {
        return {
          address: address,
          abi: ERC20Abi,
          functionName: 'balanceOf',
          args: [account]
        }
      }),
      allowFailure: false
    })
  }

  const { data: priceData } = await axios.get(`https://coins.llama.fi/prices/current/${String(uniqueAdresses.map(
    address => `${networkMap[chainId].toLowerCase()}:${address}`
  ))}`)


  return uniqueAdresses.map((address, i) => {
    const token = vaultTokens[address] || assets[address]
    return {
      ...token,
      balance: account ? Number(balances[i]) : 0,
      price: Number(priceData.coins[`${networkMap[chainId].toLowerCase()}:${address}`]?.price || 0)
    }
  })
}