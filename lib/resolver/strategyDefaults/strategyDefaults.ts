import { localhost, mainnet } from "wagmi/chains";
import StrategyDefaultResolvers, { StrategyDefaultResolverParams } from ".";
import { getAddress } from "viem";

export async function resolveStrategyDefaults({ chainId, client, address, resolver }: StrategyDefaultResolverParams & { resolver?: string }): Promise<any[]> {
  if (chainId === localhost.id) chainId = mainnet.id;

  try {
    return resolver ?
      StrategyDefaultResolvers[resolver]({ chainId, client, address: getAddress(address) })
      : StrategyDefaultResolvers.default({ chainId, client, address: getAddress(address) })
  } catch (e) {
    console.log(`resolveStrategyDefaults-${chainId}-${address}-${resolver}`, e)
    return []
  }
}