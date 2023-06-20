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
  useAssets
} from "@/lib/atoms";
import { resolveProtocolAssets } from "@/lib/resolver/protocolAssets/protocolAssets";
import Selector, { Option } from "@/components/inputs/Selector";


interface ProtocolOption extends Protocol {
  disabled: boolean;
}

async function assetSupported(protocol: Protocol, adapters: Adapter[], chainId: number, asset: string): Promise<boolean> {
  const availableAssets = await Promise.all(adapters.filter(
    (adapter) => adapter.protocol === protocol.key
  ).filter(adapter => adapter.chains.includes(chainId)).map(adapter => resolveProtocolAssets({ chainId: chainId, resolver: adapter.resolver })
  ))

  return availableAssets.flat().map(a => a?.toLowerCase()).filter((availableAsset) => availableAsset === asset).length > 0
}

async function getProtocolOptions(protocols: Protocol[], adapters: Adapter[], chainId: number, asset: string): Promise<ProtocolOption[]> {
  return Promise.all(protocols.filter(
    (p) => p.chains.includes(chainId)).map(
      async (p) => {
        return { ...p, disabled: !(await assetSupported(p, adapters, chainId, asset)) }
      })
  )
}

function ProtocolSelection() {
  const [protocolsArr, setProtocols] = useState([] as ProtocolOption[][])

  const [network] = useAtom(networkAtom);
  const [protocol, setProtocol] = useAtom(protocolAtom);
  const assets = useAssets() as {
    address: {
      [key: number]: string
    }
  }[];
  const protocols = useProtocols();
  const [options, setOptions] = useState<ProtocolOption[]>([]);

  const adapters = useAdapters();
  const [, setAdapter] = useAtom(adapterAtom);
  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [asset] = useAtom(assetAtom);

  useEffect(() => {
    if (network && protocolsArr.length === 0) {
      const protocolQueries = assets.map(item => getProtocolOptions(protocols, adapters, network.id, item.address[network.id]?.toLowerCase()))
      console.log(protocolQueries)
      Promise.all(protocolQueries).then(res => {
        setProtocols(res)
      })
      console.log(protocolsArr)
    }

    if (network && protocolsArr.length > 0 && asset.symbol !== "none") {
        setOptions(protocolsArr[assets.findIndex(
            item => item.address[network.id].toLowerCase() === asset.address[network.id].toLowerCase()
        )])
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
