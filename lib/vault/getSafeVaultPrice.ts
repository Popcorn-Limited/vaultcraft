import { ChainById, networkMap, RPC_URLS } from "@/lib/utils/connectors";
import { Address, erc20Abi, formatUnits, parseEther, parseUnits } from "viem";
import { getAddress } from "viem";
import axios from "axios";
import { http } from "viem";
import { createPublicClient } from "viem";

export default async function getSafeVaultPrice({ vault, chainId }: { vault: Address, chainId: number }) {
  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId])
  })

  // Get Configuration
  const { data: config } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/vaults/safe/${chainId}.json`
  );
  const { address, asset, safe, holdings } = config[getAddress(vault)]
  const tokens: Address[] = holdings.map((a: any) => a.token)

  // Get prices
  const { data: priceData } = await axios.get(
    `https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/coins/prices/current/${String(
      tokens.map(
        (address) => `${networkMap[chainId]}:${address}`
      )
    )}?searchWidth=4h`
  );

  // Get balances
  const balances = await client.multicall({
    contracts: tokens.map(address => ({
      address: getAddress(address),
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [safe]
    }))
  })

  const allocations = tokens.map((address, index) => {
    let data;
    const interestToken = holdings[index].interestToken
    if (interestToken) {
      data = priceData.coins[`${networkMap[chainId]}:${interestToken}`]
    } else {
      data = priceData.coins[`${networkMap[chainId]}:${address}`]
    }

    const price = Number(data.price) * (1 + holdings[index].spread)
    const balance = balances[index].result as bigint
    const balFormatted = Number(balance) / Number(parseUnits("1", data.decimals))
    return {
      address: getAddress(address),
      balance: balFormatted,
      price: price,
      value: balFormatted * price * (interestToken ? -1 : 1),
    }
  })

  const assetData = priceData.coins[`${networkMap[chainId]}:${asset}`]

  // Sum values
  const totalValueUSD = allocations.reduce((acc, curr) => acc + curr.value, 0)
  const assetValueUSD = Number(assetData.price) * (1 + holdings.find((a: any) => a.token === asset).spread)
  const totalValueInAssets = totalValueUSD / assetValueUSD

  const totalSupply = await client.readContract({
    address: vault,
    abi: erc20Abi,
    functionName: "totalSupply"
  })

  const formattedTotalSupply = Number(formatUnits(totalSupply, assetData.decimals))
  const vaultPrice = totalValueInAssets / formattedTotalSupply
  const newPrice = parseUnits(String(vaultPrice), 18)

  return {
    shareValueInAssets: newPrice,
    assetValueInShares: parseEther('1') * parseEther('1') / newPrice,
    totalValueUSD,
    formattedTotalSupply,
    vaultPriceUSD: vaultPrice,
    allocations
  }
}