import { localhost, mainnet } from "wagmi/chains";
import StrategyDefaultResolvers from ".";

export async function resolveStrategyDefaults({ chainId, address, adapter, resolver }: { chainId: number, address: string, adapter: string, resolver?: string }): Promise<any[]> {
  if (chainId === localhost.id) chainId = mainnet.id;
  return resolver ? StrategyDefaultResolvers[resolver]({ chainId, address, adapter }) : StrategyDefaultResolvers.default({ chainId, address, adapter })
}