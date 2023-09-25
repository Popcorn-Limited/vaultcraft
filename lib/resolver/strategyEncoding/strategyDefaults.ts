import { localhost, mainnet } from "wagmi/chains";
import StrategyEncodingResolvers, { StrategyEncodingResolverParams } from ".";
import { getAddress } from "viem";

export async function resolveStrategyEncoding({ chainId, client, address, params, resolver }: StrategyEncodingResolverParams & { resolver?: string }): Promise<string> {
  if (chainId === localhost.id) chainId = mainnet.id;
  try {
    return resolver
      ? StrategyEncodingResolvers[resolver]({ chainId, client, address: getAddress(address), params })
      : StrategyEncodingResolvers.default({ chainId, client, address: getAddress(address), params })
  } catch (e) {
    console.log(`resolveStrategyEncoding-${chainId}-${address}-${resolver}`, e)
    return ""
  }
}