import { localhost, mainnet } from "wagmi/chains";
import StrategyDefaultResolvers from ".";

export async function resolveStrategyDefaults({ chainId, address, resolver }: { chainId: number, address: string, resolver?: string }): Promise<any[]> {
  if (chainId === localhost.id) chainId = mainnet.id;
  
  try {
    return resolver ? StrategyDefaultResolvers[resolver]({ chainId, address }) : StrategyDefaultResolvers.default({ chainId, address })
  } catch (e) {
    console.log(`resolveStrategyDefaults-${chainId}-${address}-${resolver}`, e)
    return []
  }
}