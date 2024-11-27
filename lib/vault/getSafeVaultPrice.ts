import { ChainById, networkMap, RPC_URLS } from "@/lib/utils/connectors";
import { Address, erc20Abi, erc4626Abi, formatUnits, parseEther, parseUnits } from "viem";
import axios from "axios";
import { http } from "viem";
import { createPublicClient } from "viem";
import { DEBANK_CHAIN_IDS, OracleVaultAbi } from "@/lib/constants";

export default async function getSafeVaultPrice({ vault, chainId }: { vault: Address, chainId: number }) {
  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId])
  })

  const vaultData = await client.multicall({
    contracts: [{
      address: vault,
      abi: erc4626Abi,
      functionName: "asset"
    },
    {
      address: vault,
      abi: OracleVaultAbi,
      functionName: "safe"
    },
    {
      address: vault,
      abi: erc20Abi,
      functionName: "totalSupply"
    },
    {
      address: vault,
      abi: erc20Abi,
      functionName: "decimals"
    }],
    allowFailure: false
  })
  const asset = vaultData[0]
  const safe = vaultData[1]
  const totalSupply = vaultData[2]
  const decimals = vaultData[3]

  // Get Holdings
  const { data: holdingsData } = await axios.get(
    'https://pro-openapi.debank.com/v1/user/chain_balance',
    {
      params: {
        id: safe,
        chain_id: DEBANK_CHAIN_IDS[chainId]
      },
      headers: {
        'accept': 'application/json',
        'AccessKey': process.env.DEBANK_API_KEY
      }
    }
  );
  const totalValueUSD = holdingsData.usd_value

  if (totalValueUSD === 0) {
    return {
      vault,
      asset,
      shareValueInAssets: parseEther('1'),
      assetValueInShares: parseEther('1'),
      totalValueUSD,
      formattedTotalSupply: 0,
      vaultPriceUSD: 1,
    }
  }

  // Get Asset Price
  const { data: priceData } = await axios.get(
    `https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/coins/prices/current/${networkMap[chainId]}:${asset}?searchWidth=4h`
  );
  const assetValueUSD = priceData.coins[`${networkMap[chainId]}:${asset}`].price

  const totalValueInAssets = totalValueUSD / assetValueUSD
  const formattedTotalSupply = Number(formatUnits(totalSupply, decimals))
  const vaultPrice = totalValueInAssets / formattedTotalSupply
  const newPrice = parseUnits(String(vaultPrice), 18)

  return {
    vault,
    asset,
    shareValueInAssets: newPrice,
    assetValueInShares: parseEther('1') * parseEther('1') / newPrice,
    totalValueUSD,
    formattedTotalSupply,
    vaultPriceUSD: vaultPrice,
  }
}