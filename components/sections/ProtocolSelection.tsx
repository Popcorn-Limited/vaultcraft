import { Protocol, protocolAtom, useProtocols } from "@/lib/protocols";
import Section from "@/components/content/Section";
import { Fragment } from "react";
import Image from "next/image";
import Selector, { Option } from "../Selector";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { networkAtom } from "@/lib/networks";
import { adapterConfigAtom, useAdapters } from "@/lib/adapter";
import { RESET } from "jotai/utils";
import { assetAtom } from "@/lib/assets";

function assetSupported(protocol: any, asset: any) {
  const adapters = useAdapters();
  const adapterSupportingAsset = adapters.filter(
    (adapter) => adapter.protocol === protocol.name
  ).filter(a => a.assets.includes(asset.symbol))
  return adapterSupportingAsset.length > 0;
}

function ProtocolSelection() {
  const [network] = useAtom(networkAtom);
  const [protocol, setProtocol] = useAtom(protocolAtom);
  const protocols = useProtocols();
  const [options, setOptions] = useState<Protocol[]>(protocols);

  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [asset] = useAtom(assetAtom);

  useEffect(() => {
    if (network) {
      const filtered = protocols.filter((p) => p.chains.includes(network.id)).filter(p => assetSupported(p, asset))
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
    <Section title="Protocol Selection">
      <Selector
        selected={protocol}
        onSelect={(newProtocol) => selectProtocol(newProtocol)}
        actionContent={(selected) => (
          <Fragment>
            {selected?.logoURI && (
              <figure className="relative w-6 h-6">
                <Image
                  fill
                  className="object-contain"
                  alt="logo"
                  src={selected?.logoURI}
                />
              </figure>
            )}
            <span>{selected?.name || "Click to select"}</span>
          </Fragment>
        )}
      >
        {protocols.map((protocol) => (
          <Option value={protocol} key={`asset-selc-${protocol.name}`}>
            <figure className="relative w-6 h-6">
              <Image
                fill
                alt=""
                className="object-contain"
                src={protocol.logoURI}
              />
            </figure>
            <span>{protocol.name}</span>
          </Option>
        ))}
      </Selector>
    </Section>
  );
}

export default ProtocolSelection;
