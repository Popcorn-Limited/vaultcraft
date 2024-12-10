import { ChainById, networkMap, RPC_URLS } from "@/lib/utils/connectors";
import { Address, erc20Abi, erc4626Abi, formatUnits, parseEther, parseUnits, PublicClient } from "viem";
import axios from "axios";
import { http } from "viem";
import { createPublicClient } from "viem";
import { DEBANK_CHAIN_IDS, OracleVaultAbi } from "@/lib/constants";

export type Configuration = {
  vault: Address,
  asset: Address,
  safes: Address[],
  chainIds: number[],
  hyperliquid: HyperliquidConfig
}

export type HyperliquidConfig = {
  spot: boolean,
  perp: boolean,
  vaults: Address[]
}

export type SafeVaultPriceUpdate = {
  vault: Address,
  asset: Address,
  shareValueInAssets: bigint,
  assetValueInShares: bigint,
  totalValueUSD: number,
  formattedTotalSupply: number,
  vaultPriceUSD: number,
}

export default async function getSafeVaultPriceV2({
  configuration,
  chainId,
  totalSupply,
  decimals
}: {
  configuration: Configuration,
  chainId: number,
  totalSupply: bigint,
  decimals: number,
}) :Promise<SafeVaultPriceUpdate>{
  // Get Holdings
  const safeHoldings = await Promise.all(configuration.chainIds.map(async (chain) => await getSafeHoldings({ safes: configuration.safes, chainId: chain })))
  const hyperliquidAccountValue = await getHyperliquidAccountValue({ user: configuration.safes[0], config: configuration.hyperliquid })
  const totalValueUSD = hyperliquidAccountValue + safeHoldings.reduce((acc, curr) => acc + curr, 0)

  if (totalValueUSD === 0) {
    return {
      vault: configuration.vault,
      asset: configuration.asset,
      shareValueInAssets: parseEther('1'),
      assetValueInShares: parseEther('1'),
      totalValueUSD,
      formattedTotalSupply: 0,
      vaultPriceUSD: 1,
    }
  }

  // Get Asset Price
  const { data: priceData } = await axios.get(
    `https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/coins/prices/current/${networkMap[chainId]}:${configuration.asset}?searchWidth=4h`
  );
  const assetValueUSD = priceData.coins[`${networkMap[chainId]}:${configuration.asset}`].price

  const totalValueInAssets = totalValueUSD / assetValueUSD
  const formattedTotalSupply = Number(formatUnits(totalSupply, decimals))
  const vaultPrice = totalValueInAssets / formattedTotalSupply
  const newPrice = parseUnits(String(vaultPrice), 18)

  return {
    vault: configuration.vault,
    asset: configuration.asset,
    shareValueInAssets: newPrice,
    assetValueInShares: parseEther('1') * parseEther('1') / newPrice,
    totalValueUSD,
    formattedTotalSupply,
    vaultPriceUSD: vaultPrice,
  }
}


async function getSafeHoldings({
  safes,
  chainId,
}: {
  safes: Address[],
  chainId: number
}): Promise<number> {
  const holdings = await Promise.all(safes.map(async (safe) => {
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
    return holdingsData.usd_value
  }))
  return holdings.reduce((acc, curr) => acc + curr, 0)
}

async function getHyperliquidAccountValue({
  user,
  config
}: {
  user: Address,
  config: HyperliquidConfig
}) {
  let perpValue = 0
  if (config.perp) {
    const { data: clearinghouseStateUser } = await axios.post("https://api.hyperliquid.xyz/info", {
      type: "clearinghouseState",
      user,
      headers: { "Content-Type": "application/json" },
    });
    perpValue = Number(clearinghouseStateUser.marginSummary.accountValue)
  }

  let vaultValue = 0;
  if (config.vaults.length > 0) {
    const vaultHoldings = await Promise.all(config.vaults.map(vaultAddress => getHyperliquidVaultHolding({ user, vaultAddress })))
    vaultValue = vaultHoldings.reduce((acc, curr) => acc + curr, 0)
  }

  return vaultValue + perpValue
}

async function getHyperliquidVaultHolding({
  user,
  vaultAddress
}: {
  user: Address,
  vaultAddress: Address
}): Promise<number> {
  const { data: vaultDetails } = await axios.post("https://api-ui.hyperliquid.xyz/info", {
    type: "vaultDetails",
    user,
    vaultAddress,
    headers: { "Content-Type": "application/json" },
  });
  return Number(vaultDetails.maxWithdrawable)
}