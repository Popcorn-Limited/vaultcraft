import { useAtom } from "jotai";
import { localhost, mainnet } from "wagmi/chains";
import {
    assetAtom,
    networkAtom,
    adapterAtom,
    adapterConfigAtom,
    strategyAtom,
    DEFAULT_ADAPTER,
    DEFAULT_STRATEGY,
    protocolAtom,
    DEFAULT_PROTOCOL,
    useProtocols,
    Adapter,
    useAdapters,
    Asset,
    assetAddressesAtom,
    assets as assetsAtom,
    Protocol
} from "@/lib/atoms";
import Selector, { Option } from "@/components/inputs/Selector";
import { resolveProtocolAssets } from "@/lib/resolver/protocolAssets/protocolAssets";
import { useEffect, useState } from "react";
import Input from "../inputs/Input";
import { utils } from "ethers";
import { RPC_URLS } from "@/lib/connectors";
import { resolveAdapterApy } from "@/lib/resolver/adapterApy/adapterApy";
import TooltipIcon from "../tooltipIcon";

interface ProtocolOption extends Protocol {
    disabled: boolean;
    apy?: number;
}

const protocolDescriptions = {
    "yearn": "The Yearn protocol is a decentralized finance (DeFi) protocol that aims to optimize yield generation for cryptocurrency holders. In a vault creation, integrating the Yearn protocol allows users to deposit their assets into a Yearn vault, which automatically allocates and manages those assets across various yield-generating strategies in the DeFi ecosystem. The Yearn protocol actively seeks out the highest yield opportunities and optimizes asset allocation to maximize returns. By choosing the Yearn protocol in a vault creation, users can benefit from automated and optimized yield farming strategies, potentially earning higher yields compared to managing their assets individually.",
} as {
    [key: string]: string
}

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
        logoURI: "/images/icons/popLogo.svg",
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

function AssetProtocolSelection({
    isWithTooltips,
}: {
    isWithTooltips?: boolean
}) {
    const [network] = useAtom(networkAtom);
    const chainId = network.id === localhost.id ? mainnet.id : network.id;
    const adapters = useAdapters();

    const [asset, setAsset] = useAtom(assetAtom);
    const [protocol, setProtocol] = useAtom(protocolAtom);
    const protocols = useProtocols();
    const [options, setOptions] = useState<ProtocolOption[]>([]);
    const [assets, setAssets] = useState(assetsAtom);
    const [availableAssets, setAvailableAssets] = useAtom(assetAddressesAtom);
    const [availableAssetAddresses, setAvailableAssetsAddresses] = useAtom(assetAddressesAtom);
    const [searchTerm, setSearchTerm] = useState<string>("")

    // Only for reset
    const [, setAdapter] = useAtom(adapterAtom);
    const [, setAdapterConfig] = useAtom(adapterConfigAtom);
    const [, setStrategy] = useAtom(strategyAtom);

    const networkAssetsAvailable = (availableAssetAddresses[chainId] && Object.keys(availableAssetAddresses[chainId]).length > 0) || false

    async function assetSupported(protocol: Protocol, adapters: Adapter[], chainId: number, asset: string): Promise<boolean> {
        if (!availableAssets[chainId]) {
            const availableAssets = await Promise.all(adapters.filter(
              (adapter) => adapter.protocol === protocol.key
            ).filter(adapter => adapter.chains.includes(chainId)).map(adapter => resolveProtocolAssets({ chainId: chainId, resolver: adapter.resolver })
            ))

            return availableAssets.flat().map(a => a?.toLowerCase()).filter((availableAsset) => availableAsset === asset).length > 0
        }

        return (
          availableAssets[chainId][protocol.key]
            ?.map(a => a.toLowerCase())
            ?.filter((availableAsset) => availableAsset === asset)
            ?.length > 0
        )
    }

    async function getProtocolOptions(protocols: Protocol[], adapters: Adapter[], chainId: number, asset: string): Promise<ProtocolOption[]> {
        return Promise.all(protocols.filter(
          (p) => p.chains.includes(chainId)).map(
          async (p) => {
              const isAssetSupported = await assetSupported(p, adapters, chainId, asset)
              const protocolOption: ProtocolOption = { ...p, disabled: !isAssetSupported }
              if (isAssetSupported) protocolOption.apy = await resolveAdapterApy({ chainId: chainId, address: asset, resolver: p.key })
              return protocolOption
          })
        )
    }

    useEffect(() => {
        async function setUpNetworkAssets() {
            const networkAssets = await addProtocolAssets(adapters.filter(adapter => adapter.chains.includes(chainId)), chainId)
            setAvailableAssetsAddresses({ ...availableAssetAddresses, [chainId]: networkAssets })
        }

        if (!networkAssetsAvailable) {
            setUpNetworkAssets()
        }
    }, [chainId]);

    useEffect(() => {
        const newAssets = assets.filter(a => a.chains?.includes(chainId)).filter(
          item => searchTerm === "" ? true :
            item.address[String(chainId)].toLowerCase().includes(searchTerm) ||
            item.name.toLowerCase().includes(searchTerm) ||
            item.symbol.toLowerCase().includes(searchTerm)
        )

        if (newAssets.length === 0
          && utils.isAddress(searchTerm)
          && availableAssetAddresses[chainId].all.includes(searchTerm)) {
            getTokenMetadata(searchTerm, chainId).then(res => setAssets([res]))
        } else {
            setAssets(newAssets)
        }

    }, [searchTerm]);

    useEffect(() => {
        if (network && asset.symbol !== "none") {
            getProtocolOptions(protocols, adapters, network.id, asset.address[network.id].toLowerCase()).then(res => setOptions(res));
        }
    }, [network, asset]);

    function selectAsset(newAsset: any) {
        if (asset !== newAsset) {
            setProtocol(DEFAULT_PROTOCOL)
            setAdapter(DEFAULT_ADAPTER)
            setAdapterConfig([])
            setStrategy(DEFAULT_STRATEGY)
        }
        setAsset(newAsset)
    }

    function selectProtocol(newProtocol: any) {
        if (protocol !== newProtocol) {
            setAdapterConfig([])
            setAdapter(DEFAULT_ADAPTER)
        }
        setProtocol(newProtocol)
    }

    return (
      <section className={`flex flex-col md:flex-row gap-6 md:gap-4`}>
          <Selector
            selected={asset}
            onSelect={(newAsset) => selectAsset(newAsset)}
            title="Select Asset"
            description="Choose an asset that you want to deposit into your vault and earn yield on."
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
              {assets.length > 0 ?
                assets.map((assetIter) => (
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
          <Selector
            selected={protocol}
            onSelect={(newProtocol) => selectProtocol(newProtocol)}
            title="Select Protocol"
            description="Select a protocol you want to use to earn yield on your asset."
          >
              {options.length > 0 ? options.sort((a, b) => (b?.apy || 0) - (a?.apy || 0)).map((protocolIter) => (
                <Option
                  key={`protocol-selc-${protocolIter.name}`}
                  value={protocolIter}
                  selected={protocolIter?.name === protocol.name}
                  disabled={protocolIter.disabled}
                  apy={protocolIter?.apy}
                >
                    {
                        isWithTooltips && (
                            <TooltipIcon className={`my-auto px-2`} message={protocolDescriptions[protocolIter.key]} title={protocolIter.name} />
                        )
                    }
                </Option>
              )) : <p className="text-white">Loading, please wait...</p>}
          </Selector>
      </section>
    );
}

export default AssetProtocolSelection;
