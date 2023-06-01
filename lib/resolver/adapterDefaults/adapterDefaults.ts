import AdapterDefaultResolvers from ".";

export async function resolveAdapterDefaults({ chainId, address, resolver }: { chainId: number, address: string, resolver?: string }): Promise<any> {
  if (chainId === 1337) chainId = 1;
  // @ts-ignore
  return resolver ? AdapterDefaultResolvers[resolver]({chainId, address}) : AdapterDefaultResolvers.default({chainId, address})
}