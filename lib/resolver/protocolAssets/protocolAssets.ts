import { localhost, mainnet } from "wagmi/chains";
import ProtocolAssetResolvers from "."

export async function resolveProtocolAssets({ chainId, resolver }: { chainId: number, resolver?: string }): Promise<string[]> {
  if (chainId === localhost.id) chainId = mainnet.id;
  return resolver ? await ProtocolAssetResolvers[resolver]({ chainId }) : await ProtocolAssetResolvers.default({ chainId })
}