import getAssetAndValueByVault from "@/lib/vault/getAssetAndAssetsPerShare";
import { PriceResolverParams } from "..";
import { resolvePrice } from "../price";

export async function vault({ address, chainId, client }: PriceResolverParams): Promise<number> {
  if (!client) return 0;
  
  const { asset, assetsPerShare } = await getAssetAndValueByVault({ address, client });
  const price = await resolvePrice({ chainId: chainId, client: client, address: asset, resolver: 'llama' })

  return Number(assetsPerShare) * price
}
