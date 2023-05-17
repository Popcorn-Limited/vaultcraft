import AdapterDefaultResolver from "."

export async function resolveAdapterDefaults({ chainId, address, resolver }: { chainId: number, address: string, resolver?: string }): Promise<any> {
  // @ts-ignore
  return resolver ? await AdapterDefaultResolver[resolver](chainId, address) : await AdapterDefaultResolver.default(chainId, address)
}