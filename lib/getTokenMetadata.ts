import { Asset } from "./atoms";

export default async function getTokenMetadata(address: string, chainId: number): Promise<Asset> {
  const metadata = {
    name: "",
    symbol: "",
    decimals: 0,
    logoURI: "https://forum.popcorn.network/uploads/default/optimized/1X/4ad0b80c41129e6d8b04d49799bbbfcc6c8e9a91_2_32x32.png",
    address: { [chainId]: address },
    chains: [chainId]
  }

  const options = {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      id: chainId,
      jsonrpc: '2.0',
      method: 'alchemy_getTokenMetadata',
      params: [address]
    })
  };

  try {
    // @ts-ignore
    const res = await fetch(RPC_URLS[chainId], options)
    const data = await res.json()

    metadata.name = data.result.name
    metadata.symbol = data.result.symbol
    metadata.decimals = data.result.decimals
    if (data.result.logo) metadata.logoURI = data.result.logo
  } catch (e) { console.error("error", e) }

  return metadata
}