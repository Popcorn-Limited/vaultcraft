import { arbitrum, localhost } from "wagmi/chains";
import AdapterDefaultResolvers from ".";

export async function resolveAdapterDefaults({ chainId, address, resolver }: { chainId: number, address: string, resolver?: string }): Promise<any> {
  if (chainId === localhost.id) chainId = arbitrum.id;
  // @ts-ignore
  return resolver ? AdapterDefaultResolvers[resolver]({chainId, address}) : AdapterDefaultResolvers.default({chainId, address})
}