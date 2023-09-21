import { localhost, mainnet } from "wagmi/chains";
import AdapterApyResolvers from ".";

export async function resolveAdapterApy({ chainId, address, resolver }: { chainId: number, address: string, resolver?: string }): Promise<number> {
  if (chainId === localhost.id) chainId = mainnet.id;

  try {
    return resolver ? AdapterApyResolvers[resolver]({ chainId, address }) : AdapterApyResolvers.default({ chainId, address })
  } catch (e) {
    console.log(`resolveAdapterApyError-${chainId}-${address}-${resolver}`, e)
    return 0
  }
}