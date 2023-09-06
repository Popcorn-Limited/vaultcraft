import { Asset, DEFAULT_ADAPTER, DEFAULT_PROTOCOL, DEFAULT_STRATEGY, adapterAtom, adapterConfigAtom, assetAddressesAtom, assetAtom, assets, networkAtom, protocolAtom, strategyAtom, useAdapters } from "@/lib/atoms";
import Input from "../inputs/Input";
import Selector, { Option } from "../inputs/Selector";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { localhost, mainnet } from "wagmi/chains";
import { utils } from "ethers";


// 1. Display json tokenlist 
// 2. Fetch all asset addresses
// 3. Allow to add a token via address (-> add the metadata)

async function getTokenMetadata(address: string, chainId: number, protocol: string): Promise<Asset> {
  const metadata = {
    name: "",
    symbol: "",
    decimals: 0,
    logoURI: "https://etherscan.io/images/main/empty-token.png",
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

  const [asset, setAsset] = useAtom(assetAtom);

  const [availableAssets, setAvailableAssets] = useState(assets);
  const [availableAssetAddresses, setAvailableAssetsAddresses] = useAtom(assetAddressesAtom);

  const [searchTerm, setSearchTerm] = useState<string>("")

  // Only for reset
  const [, setAdapter] = useAtom(adapterAtom);
  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [, setStrategy] = useAtom(strategyAtom);
  const [protocol, setProtocol] = useAtom(protocolAtom);

  const networkAssetsAvailable = (availableAssetAddresses[chainId] && Object.keys(availableAssetAddresses[chainId]).length > 0) || false

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
      getTokenMetadata(searchTerm, chainId, protocol.key).then(res => setAvailableAssets([res]))
    } else {
      setAvailableAssets(avAssets)
    }

  }, [searchTerm])

  function selectAsset(newAsset: any) {
    if (asset !== newAsset) {
      setProtocol(DEFAULT_PROTOCOL)
      setStrategy(DEFAULT_STRATEGY)
    }
    setAsset(newAsset)
  }

  return (
    <Selector
      selected={asset}
      onSelect={(newAsset) => selectAsset(newAsset)}
      title="Select Asset"
      description="Choose an asset that you want to deposit into your vault and earn yield on. If you can't find your asset in the list, paste its address into the search bar to add it."
      optionalChildren={
        <div className="h-12">
          <Input
            onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value.toLowerCase())}
            placeholder={networkAssetsAvailable ? "Search by name, symbol or address" : "Loading more assets..."}
            defaultValue={searchTerm}
            autoComplete="off"
            autoCorrect="off"
            disabled={!networkAssetsAvailable}
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
            apy={assetIter.apy}
          >
          </Option>
        )) :
        <p className="text-white">Asset not available...</p>
      }
    </Selector >
  );
}

export default AssetSelection;