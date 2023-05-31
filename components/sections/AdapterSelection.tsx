import { Adapter, adapterAtom, adapterConfigAtom, useAdapters } from "@/lib/adapter";
import Section from "@/components/content/Section";
import { Fragment } from "react";
import Image from "next/image";
import Selector, { Option } from "../Selector";
import { protocolAtom } from "@/lib/protocols";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { strategyAtom } from "@/lib/strategy";

function AdapterSelection() {
  const [protocol] = useAtom(protocolAtom);
  const [adapter, setAdapter] = useAtom(adapterAtom);
  const adapters = useAdapters();
  const [options, setOptions] = useState<Adapter[]>(adapters);

  // Only for reset
  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [, setStrategy] = useAtom(strategyAtom);

  useEffect(() => {
    if (protocol) {
      const filtered = adapters.filter(
        (adapter) => adapter.protocol === protocol.name
      );
      setOptions(filtered);
      setAdapter(filtered[0]);
    }
  }, [protocol]);

  function selectAdapter(newAdapter: any) {
    if (adapter !== newAdapter) {
      setAdapterConfig(RESET)
      setStrategy(RESET)
    }
    setAdapter(newAdapter)
  }

  return (
    <section className="mb-4">
      <Selector
        selected={adapter}
        onSelect={(newAdapter) => selectAdapter(newAdapter)}
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
            <span className="text-[white] w-full flex self-center flex-row justify-start">{selected?.name || "Protocol selection"}</span>
            <span className="self-center text-[white] mr-2">{`>`}</span>
          </Fragment>
        )}
      >
        <div className="w-full h-full bg-black flex flex-col items-start gap-y-1 px-8 py-9">
          <p className="text-[white] text-2xl mb-9">Select Adapter</p>
          <p className="text-[white] mb-8">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna ut labore et dolore magna.</p>
          <div className="flex flex-col overflow-y-scroll w-full">
            {options.map((adapterIter) => (
              <Option
                value={adapterIter}
                selected={adapterIter.name === adapter?.name}
                key={`asset-selc-${adapterIter.key}-${adapterIter.name}`}
              >
              </Option>
            ))}
          </div>
        </div>
      </Selector>
    </section>
  );
}

export default AdapterSelection;
