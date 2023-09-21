import { Protocol, useProtocols } from "./atoms";
import { resolveProtocolAssets } from "./resolver/protocolAssets/protocolAssets";

export default async function getSupportedAssetAddresses(chainId: number, protocols: Protocol[]): Promise<{ [key: string]: string[] }> {
  const applicableProtocols = protocols.filter((p) => p.chains.includes(chainId))

  const addressesByProtocol = await Promise.all(applicableProtocols.map(protocol => resolveProtocolAssets({ chainId, resolver: protocol.key })))
  const result: { [key: string]: string[] } = { all: addressesByProtocol.flat().map(a => a?.toLowerCase()) }
  applicableProtocols.forEach((p, i) => result[p.key] = addressesByProtocol[i].map(a => a?.toLowerCase()))

  return result
}