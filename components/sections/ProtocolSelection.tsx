import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { Adapter, adapterConfigAtom, useAdapters, assetAtom, networkAtom, Protocol, protocolAtom, useProtocols, adapterAtom, DEFAULT_ADAPTER } from "@/lib/atoms";
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
  const [network] = useAtom(networkAtom);
  const [protocol, setProtocol] = useAtom(protocolAtom);
  const protocols = useProtocols();
  const [options, setOptions] = useState<ProtocolOption[]>([]);

  const adapters = useAdapters();
  const [, setAdapter] = useAtom(adapterAtom);
  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [asset] = useAtom(assetAtom);

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
        actionContent={(selected) => (
          <div className="h-12 flex flex-row items-center w-full gap-x-3">
            {selected?.logoURI && (
              <div className="w-9 h-8">
                <img
                  className="object-contain w-8 h-8 rounded-full"
                  alt="selected-protocol"
                  src={selected?.logoURI}
                />
              </div>
            )}
            <span className="text-[white] w-full flex self-center flex-row justify-start">{selected?.name || "Protocol selection"}</span>
            <span className="self-center text-[white] mr-2">{`>`}</span>
          </div>
        )}
      >
        <div className="w-full h-full bg-black flex flex-col items-start gap-y-1 px-8 py-9">
          <p className="text-[white] text-2xl mb-9">Select Protocol</p>
          <p className="text-[white] mb-8">Select a protocol you want to use to earn yield on your asset.</p>
          <div className="flex flex-col overflow-y-scroll w-full scrollbar-hide space-y-2">
            {options.length > 0 ? options.map((protocolIter) => (
              <Option
                key={`protocol-selc-${protocolIter.name}`}
                value={protocolIter}
                selected={protocolIter?.name === protocol.name}
                disabled={protocolIter.disabled}
              >
              </Option>
            )) : <p className="text-white">Loading, please wait...</p>}
          </div>
        </div>
      </Selector>
    </section>
  );
}

export default ProtocolSelection;
