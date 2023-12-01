import { localhost, mainnet } from "wagmi/chains";
import PriceResolvers, { PriceResolverParams } from ".";
import { getAddress } from "viem";

export async function resolvePrice({ address, chainId, client, resolver }: PriceResolverParams & { resolver?: string }): Promise<number> {
  if (chainId === localhost.id) chainId = mainnet.id;

  try {
    return resolver ?
      PriceResolvers[resolver]({ chainId, client, address: getAddress(address) })
      : PriceResolvers.default({ chainId, client, address: getAddress(address) })
  } catch (e) {
    console.log(`resolvePrice-${chainId}-${address}-${resolver}`, e)
    return 0;
  }
}