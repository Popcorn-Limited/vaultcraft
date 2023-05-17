import ProtocolAssetResolvers from "."

export async function resolveProtocolAssets({ chainId, resolver }: { chainId: number, resolver?: string }): Promise<string[]> {
  // @ts-ignore
  return resolver ? await ProtocolAssetResolvers[resolver](chainId) : await ProtocolAssetResolvers.default(chainId)
}