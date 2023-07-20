import { useAtom } from "jotai";
import { localhost, mainnet } from "wagmi/chains";
import { assetAtom, networkAtom, adapterAtom, adapterConfigAtom, strategyAtom, DEFAULT_ADAPTER, DEFAULT_STRATEGY, protocolAtom, DEFAULT_PROTOCOL, availableAssetsAtom, Adapter, useAdapters, Asset, assetAddressesAtom, assets } from "@/lib/atoms";
import Selector, { Option } from "@/components/inputs/Selector";
import { resolveProtocolAssets } from "@/lib/resolver/protocolAssets/protocolAssets";
import { useEffect, useState } from "react";
import Input from "../inputs/Input";
import { utils } from "ethers";
import { RPC_URLS } from "@/lib/connectors";

async function addProtocolAssets(adapters: Adapter[], chainId: number): Promise<{ [key: string]: string[] }> {
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

async function getTokenMetadata(address: string, chainId: number): Promise<Asset> {
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

function AssetSelection() {
  const [network] = useAtom(networkAtom);
  const chainId = network.id === localhost.id ? mainnet.id : network.id;
  const adapters = useAdapters();

  const [asset, setAsset] = useAtom(assetAtom);
  const [availableAssets, setAvailableAssets] = useState(assets);
  const [availableAssetAddresses, setAvailableAssetsAddresses] = useAtom(assetAddressesAtom);
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Only for reset
  const [, setAdapter] = useAtom(adapterAtom);
  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [, setStrategy] = useAtom(strategyAtom);
  const [, setProtocol] = useAtom(protocolAtom);

  console.log(availableAssetAddresses)

  useEffect(() => {
    if (!availableAssetAddresses[chainId] || Object.keys(availableAssetAddresses[chainId]).length === 0) {
      addProtocolAssets(
        adapters.filter(adapter => adapter.chains.includes(chainId)), chainId)
        .then(res => setAvailableAssetsAddresses({ ...availableAssetAddresses, [chainId]: res })
        )
    }
  }, [chainId]);

  useEffect(() => {
    const avAssets = assets.filter(a => a.chains?.includes(chainId)).filter(
      item => searchTerm === "" ? true :
        item.address[String(chainId)].toLowerCase().includes(searchTerm) ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.symbol.toLowerCase().includes(searchTerm)
    )

    if (avAssets.length === 0
      && utils.isAddress(searchTerm)
      && availableAssetAddresses[chainId].all.includes(searchTerm)) {
      getTokenMetadata(searchTerm, chainId).then(res => setAvailableAssets([res]))
    } else {
      setAvailableAssets(avAssets)
    }

  }, [searchTerm])

  function selectAsset(newAsset: any) {
    if (asset !== newAsset) {
      setProtocol(DEFAULT_PROTOCOL)
      setAdapter(DEFAULT_ADAPTER)
      setAdapterConfig([])
      setStrategy(DEFAULT_STRATEGY)
    }
    setAsset(newAsset)
  }

  return (
    <Selector
      selected={asset}
      onSelect={(newAsset) => selectAsset(newAsset)}
      title="Select Asset"
      description="Choose an asset that you want to deposit into your vault and earn yield on."
      optionalChildren={
        <div className="h-12">
          <Input
            onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value.toLowerCase())}
            placeholder="Search by name, symbol or address"
            defaultValue={searchTerm}
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
      }
    >
      {availableAssets.length > 0 ?
        availableAssets.map((assetIter) => (
          <Option
            // @ts-ignore
            key={`asset-selc-${assetIter.address[String(chainId)]}`}
            selected={asset.name === assetIter.name}
            value={assetIter}
          >
          </Option>
        )) :
        <p className="text-white">Asset not available...</p>
      }
    </Selector >
  );
}

export default AssetSelection;
