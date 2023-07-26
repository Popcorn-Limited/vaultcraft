import { Adapter } from "./atoms"
import { resolveProtocolAssets } from "./resolver/protocolAssets/protocolAssets"

export default async function addProtocolAssets(adapters: Adapter[], chainId: number): Promise<{ [key: string]: string[] }> {
  const protocolQueries = [] as Promise<string[]>[]
  const filteredAdapters: Adapter[] = adapters.filter(adapter => adapter.chains.includes(chainId))

  try {
    filteredAdapters.forEach(
      adapter => protocolQueries.push(resolveProtocolAssets({ chainId: chainId, resolver: adapter.resolver }))
    )

    const protocolsResult = await Promise.all(protocolQueries)
    const result = {} as {
      [key: string]: string[]
    }
    filteredAdapters.forEach((item, idx) => {
      result[item.protocol] = protocolsResult[idx]
    })
    result.all = Object.keys(result).map(key => result[key]).flat().map(address => address.toLowerCase())

    return result
  } catch (e) {
    console.error("error", e)
    return {}
  }
}