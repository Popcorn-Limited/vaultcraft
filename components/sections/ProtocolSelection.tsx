import { Protocol, protocolAtom, useProtocols } from "@/lib/protocols";
import { Fragment } from "react";
import Selector, { Option } from "../Selector";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { networkAtom } from "@/lib/networks";
import { Adapter, adapterConfigAtom, useAdapters } from "@/lib/adapter";
import { RESET } from "jotai/utils";
import { assetAtom } from "@/lib/assets";

function supportedAssets(protocol: any, asset: any, adapters: Adapter[]) {
  const adapterSupportingAsset = adapters.filter(
    (adapter) => adapter.protocol === protocol.name
  ).filter(a => a.assets.includes(asset?.symbol))
  return adapterSupportingAsset.length > 0;
}

function ProtocolSelection() {
  const [network] = useAtom(networkAtom);
  const [protocol, setProtocol] = useAtom(protocolAtom);
  const protocols = useProtocols();
  const [options, setOptions] = useState<Protocol[]>(protocols);

  const adapters = useAdapters();
  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [asset] = useAtom(assetAtom);

  useEffect(() => {
    if (network) {
      const filtered = protocols.filter((p) => p.chains.includes(network.id)).filter(p => supportedAssets(p, asset, adapters))
      setOptions(filtered);
    }
  }, [network]);

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
          <div className="flex flex-col overflow-y-scroll w-full">
            {protocols.map((protocolIter) => (
              <Option selected={protocolIter?.name === protocol?.name} value={protocolIter} key={`asset-selc-${protocolIter.name}`}>
              </Option>
            ))}
          </div>
        </div>
      </Selector>
    </section>
  );
}

export default ProtocolSelection;
