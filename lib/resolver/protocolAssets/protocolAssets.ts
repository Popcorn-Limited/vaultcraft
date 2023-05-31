import ProtocolAssetResolvers from "."

export async function resolveProtocolAssets({ chainId, resolver }: { chainId: number, resolver?: string }): Promise<string[]> {
  if (chainId === 1337) chainId = 1;
  // @ts-ignore
  return resolver ? await ProtocolAssetResolvers[resolver]({chainId}) : await ProtocolAssetResolvers.default({chainId})
}