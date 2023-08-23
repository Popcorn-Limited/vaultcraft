import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  Adapter,
  adapterAtom,
  adapterConfigAtom,
  useAdapters,
  protocolAtom,
  networkAtom,
  assetAtom,
  strategyAtom,
  DEFAULT_STRATEGY,
  assetAddressesAtom
} from "@/lib/atoms";
import { resolveProtocolAssets } from "@/lib/resolver/protocolAssets/protocolAssets";
import { resolveAdapterDefaults } from "@/lib/resolver/adapterDefaults/adapterDefaults";
import Selector, { Option } from "@/components/inputs/Selector";

interface AdapterOption extends Adapter {
  disabled: boolean;
}

function AdapterSelection({
  isDisabled = false,
}) {
  const [network] = useAtom(networkAtom);
  const [protocol] = useAtom(protocolAtom);
  const [asset] = useAtom(assetAtom);
  const [availableAssetAddresses, setAvailableAssetsAddresses] = useAtom(assetAddressesAtom);

  const [adapter, setAdapter] = useAtom(adapterAtom);
  const adapters = useAdapters();
  const [options, setOptions] = useState<AdapterOption[]>([]);

  // Only for reset
  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [, setStrategy] = useAtom(strategyAtom);

  async function assetSupported(adapter: Adapter, chainId: number, asset: string): Promise<boolean> {
    if (!availableAssetAddresses[chainId]) {
      const protocolAssets = await resolveProtocolAssets({ chainId: chainId, resolver: adapter.resolver })
      const newAvailable = { ...availableAssetAddresses }
      newAvailable[chainId][adapter.protocol] = protocolAssets
      setAvailableAssetsAddresses(newAvailable)

      return protocolAssets.map(a => a.toLowerCase()).filter((availableAsset) => availableAsset === asset).length > 0
    }

    return (
      availableAssetAddresses[chainId][adapter.protocol]
        .map(a => a.toLowerCase())
        .filter((availableAsset) => availableAsset === asset)
        .length > 0
    )
  }

  async function getAdapterOptions(adapters: Adapter[], chainId: number, asset: string): Promise<AdapterOption[]> {
    return Promise.all(
      adapters.map(async (adapter) => {
        return { ...adapter, disabled: !(await assetSupported(adapter, chainId, asset)) }
      })
    )
  }

  useEffect(() => {
    if (protocol.key !== "none" && asset.symbol !== "none" && network) {
      getAdapterOptions(
        adapters.filter((adapter) => adapter.protocol === protocol.key).filter(adapter => adapter.chains.includes(network.id)),
        network.id,
        asset.address[network.id].toLowerCase()
      )
        .then(res => {
          setOptions(res);
          if (res.length > 0 && adapter.key === "none") setAdapter(res[0]);
        });
    }
  }, [protocol, asset, network]);

  useEffect(
    () => {
      // Set defaults if the adapter has init params
      if (adapter.initParams && adapter.initParams.length > 0) {
        setAdapterConfig(adapter.initParams.map(i => "Loading configuration..."))

        // Set config defaults
        resolveAdapterDefaults({
          chainId: network.id,
          address: asset.address[network.id].toLowerCase(),
          resolver: adapter.resolver
        }).then(res => setAdapterConfig(res))
      } else {
        // Set config defaults
        setAdapterConfig([])
      }
    },
    [adapter]
  );

  function selectAdapter(newAdapter: any) {
    if (adapter !== newAdapter) {
      setAdapterConfig([])
      setStrategy(DEFAULT_STRATEGY)
    }
  }

  return (
    <section>
      <Selector
        selected={adapter}
        onSelect={(newAdapter) => selectAdapter(newAdapter)}
        title="Select Adapter"
        description="Choose an adapter for your selected protocol."
        disabled={isDisabled}
      >
        {options.map((adapterIter) => (
          <Option
            value={adapterIter}
            selected={adapterIter.name === adapter.name}
            key={`adapter-selc-${adapterIter.key}-${adapterIter.name}`}
          >
          </Option>
        ))}
      </Selector>
    </section>
  );
}

export default AdapterSelection;
