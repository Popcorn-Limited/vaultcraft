import { Fragment, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { Adapter, adapterConfigAtom, useAdapters, assetAtom, networkAtom, Protocol, protocolAtom, useProtocols } from "@/lib/atoms";
import { resolveProtocolAssets } from "@/lib/resolver/protocolAssets/protocolAssets";
import Selector, { Option } from "@/components/inputs/Selector";


interface ProtocolOption extends Protocol {
  disabled: boolean;
}

async function assetSupported(protocol: Protocol, adapters: Adapter[], chainId: number, asset: string): Promise<boolean> {
  const availableAssets = await Promise.all(adapters.filter(
    (adapter) => adapter.protocol === protocol.name
  ).map(adapter => resolveProtocolAssets({ chainId: chainId, resolver: adapter.resolver })
  ))

  return availableAssets.flat().map(a => a.toLowerCase()).filter((availableAsset) => availableAsset === asset).length > 0
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
  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [asset] = useAtom(assetAtom);

  useEffect(() => {
    if (network && asset) {
      // TODO - remove hardcoded network id
      getProtocolOptions(protocols, adapters, 42161, asset.address["42161"].toLowerCase()).then(res => setOptions(res));
    }
  }, [network, asset]);

  function selectProtocol(newProtocol: any) {
    if (protocol !== newProtocol) {
      setAdapterConfig(RESET)
    }
    setProtocol(newProtocol)
  }

  return (
    <section className="mt-4 mb-4">
      <Selector
        selected={protocol}
        onSelect={(newProtocol) => selectProtocol(newProtocol)}
        actionContent={(selected) => (
          <Fragment>
            {selected?.logoURI && (
              <figure className="h-12 py-2 flex-row items-center flex relative">
                <img
                  className="object-contain h-full w-fit"
                  alt="logo"
                  src={selected?.logoURI}
                />
              </figure>
            )}
            <span className="text-[white] w-full flex self-center flex-row justify-start">{selected?.name || "Protocol selection"}</span><span className="self-center text-[white] mr-2">{`>`}</span>
          </Fragment>
        )}
      >
        <div className="w-full h-full bg-black flex flex-col items-start gap-y-1 px-8 py-9">
          <p className="text-[white] text-2xl mb-9">Select Protocol</p>
          <p className="text-[white] mb-8">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna ut labore et dolore magna.</p>
          <div className="flex flex-col overflow-y-scroll w-full space-y-2">
            {options.map((protocolIter) => (
              <Option
                key={`asset-selc-${protocolIter.name}`}
                value={protocolIter}
                selected={protocolIter?.name === protocol?.name}
                disabled={protocolIter.disabled}
              >
              </Option>
            ))}
          </div>
        </div>
      </Selector>
    </section>
  );
}

export default ProtocolSelection;
