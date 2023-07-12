import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  Adapter,
  adapterConfigAtom,
  useAdapters,
  assetAtom,
  networkAtom,
  Protocol,
  protocolAtom,
  useProtocols,
  adapterAtom,
  DEFAULT_ADAPTER,
  assetAddressesAtom
} from "@/lib/atoms";
import { resolveProtocolAssets } from "@/lib/resolver/protocolAssets/protocolAssets";
import Selector, { Option } from "@/components/inputs/Selector";


interface ProtocolOption extends Protocol {
  disabled: boolean;
}

function ProtocolSelection() {
  const [network] = useAtom(networkAtom);
  const [protocol, setProtocol] = useAtom(protocolAtom);
  const protocols = useProtocols();
  const [options, setOptions] = useState<ProtocolOption[]>([]);

  const adapters = useAdapters();
  const [, setAdapter] = useAtom(adapterAtom);
  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [availableAssets] = useAtom(assetAddressesAtom);
  const [asset] = useAtom(assetAtom);

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
          return { ...p, disabled: !(await assetSupported(p, adapters, chainId, asset)) }
        })
    )
  }

  useEffect(() => {
    if (network && asset.symbol !== "none") {
      getProtocolOptions(protocols, adapters, network.id, asset.address[network.id].toLowerCase()).then(res => setOptions(res));
    }
  }, [network, asset]);

  function selectProtocol(newProtocol: any) {
    if (protocol !== newProtocol) {
      setAdapterConfig([])
      setAdapter(DEFAULT_ADAPTER)
    }
    setProtocol(newProtocol)
  }

  return (
    <section className="mt-4 mb-4">
      <Selector
        selected={protocol}
        onSelect={(newProtocol) => selectProtocol(newProtocol)}
        title="Select Protocol"
        description="Select a protocol you want to use to earn yield on your asset."
      >
        {options.length > 0 ? options.map((protocolIter) => (
          <Option
            key={`protocol-selc-${protocolIter.name}`}
            value={protocolIter}
            selected={protocolIter?.name === protocol.name}
            disabled={protocolIter.disabled}
          >
          </Option>
        )) : <p className="text-white">Loading, please wait...</p>}
      </Selector>
    </section>
  );
}

export default ProtocolSelection;
