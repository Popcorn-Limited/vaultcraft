import { Address, createPublicClient, erc20Abi, formatUnits, http, parseEther, parseUnits } from "viem";
import axios from "axios";
import { DEBANK_CHAIN_IDS } from "@/lib/constants";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";

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
  assetPrice: number,
  totalValueInAssets: number,
  formattedTotalSupply: number,
  vaultPriceUSD: number,
}

export default async function getSafeVaultPriceV2({
  configuration,
  chainId,
  decimals
}: {
  configuration: Configuration,
  chainId: number,
  decimals: number,
}): Promise<SafeVaultPriceUpdate> {
  // Get Holdings
  const safeHoldings = await Promise.all(configuration.chainIds.map(async (chain) => await getSafeHoldings({ safes: configuration.safes, chainId: chain })))
  const hyperliquidAccountValue = await getHyperliquidAccountValue({ user: configuration.safes[0], config: configuration.hyperliquid })
  const totalValueUSD = hyperliquidAccountValue + safeHoldings.reduce((acc, curr) => acc + curr, 0)
  const totalSupply = await createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId]),
  }).readContract({
    address: configuration.vault,
    abi: erc20Abi,
    functionName: "totalSupply",
  });

  if (totalValueUSD === 0) {
    return {
      vault: configuration.vault,
      asset: configuration.asset,
      shareValueInAssets: parseEther('1'),
      assetValueInShares: parseEther('1'),
      totalValueUSD,
      assetPrice: 0,
      totalValueInAssets: 0,
      formattedTotalSupply: 0,
      vaultPriceUSD: 0,
    }
  }

  // Get Asset Price
  const { data: assetData } = await axios.get(
    'https://pro-openapi.debank.com/v1/token',
    {
      params: {
        id: configuration.asset,
        chain_id: DEBANK_CHAIN_IDS[chainId]
      },
      headers: {
        'accept': 'application/json',
        'AccessKey': process.env.DEBANK_API_KEY
      }
    }
  );
  const totalValueInAssets = totalValueUSD / assetData.price
  const formattedTotalSupply = Number(formatUnits(totalSupply, decimals))
  const vaultPrice = totalValueInAssets / formattedTotalSupply
  const newPrice = parseUnits(String(vaultPrice), 18)

  return {
    vault: configuration.vault,
    asset: configuration.asset,
    shareValueInAssets: newPrice,
    assetValueInShares: parseEther('1') * parseEther('1') / newPrice,
    totalValueUSD,
    assetPrice: assetData.price,
    totalValueInAssets: totalValueInAssets,
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
    console.log(holdingsData)
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