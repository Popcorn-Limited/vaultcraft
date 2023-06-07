import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { Adapter, adapterAtom, adapterConfigAtom, useAdapters, protocolAtom, networkAtom, assetAtom, strategyAtom, DEFAULT_STRATEGY } from "@/lib/atoms";
import { resolveProtocolAssets } from "@/lib/resolver/protocolAssets/protocolAssets";
import Selector, { Option } from "@/components/inputs/Selector";

interface AdapterOption extends Adapter {
  disabled: boolean;
}

async function assetSupported(adapter: Adapter, chainId: number, asset: string): Promise<boolean> {
  const availableAssets = await resolveProtocolAssets({ chainId: chainId, resolver: adapter.resolver })

  return availableAssets.flat().map(a => a.toLowerCase()).filter((availableAsset) => availableAsset === asset).length > 0
}

async function getAdapterOptions(adapters: Adapter[], chainId: number, asset: string): Promise<AdapterOption[]> {
  return Promise.all(
    adapters.map(async (adapter) => {
      return { ...adapter, disabled: !(await assetSupported(adapter, chainId, asset)) }
    })
  )
}

function AdapterSelection() {
  const [network] = useAtom(networkAtom);
  const [protocol] = useAtom(protocolAtom);
  const [asset] = useAtom(assetAtom);

  const [adapter, setAdapter] = useAtom(adapterAtom);
  const adapters = useAdapters();
  const [options, setOptions] = useState<AdapterOption[]>([]);

  // Only for reset
  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [, setStrategy] = useAtom(strategyAtom);

  useEffect(() => {
    if (protocol.key !== "none" && asset.symbol !== "none" && network) {
      // TODO - remove hardcoded network id
      getAdapterOptions(adapters.filter(
        (adapter) => adapter.protocol === protocol.name), 42161, asset.address["42161"].toLowerCase())
        .then(res => {
          setOptions(res);
          if (res.length > 0) setAdapter(res[0]);
        });
    }
  }, [protocol, asset, network]);

  function selectAdapter(newAdapter: any) {
    if (adapter !== newAdapter) {
      setAdapterConfig([])
      setStrategy(DEFAULT_STRATEGY)
    }
    setAdapter(newAdapter)
  }

  return (
    <section className="mb-4">
      <Selector
        selected={adapter}
        onSelect={(newAdapter) => selectAdapter(newAdapter)}
        actionContent={(selected) => (
          <div className="h-12 flex flex-row items-center w-full gap-x-2">
            {selected?.logoURI && (
              <figure className="h-12 py-2 flex-row items-center flex relative">
                <img
                  className="object-contain h-full w-fit"
                  alt="logo"
                  src={selected?.logoURI}
                />
              </figure>
            )}
            <span className="text-[white] w-full flex self-center flex-row justify-start">{selected?.name || "Adapter selection"}</span>
            <span className="self-center text-[white] mr-2">{`>`}</span>
          </div>
        )}
      >
        <div className="w-full h-full bg-black flex flex-col items-start gap-y-1 px-8 py-9">
          <p className="text-[white] text-2xl mb-9">Select Adapter</p>
          <p className="text-[white] mb-8">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna ut labore et dolore magna.</p>
          <div className="flex flex-col overflow-y-scroll w-full">
            {options.map((adapterIter) => (
              <Option
                value={adapterIter}
                selected={adapterIter.name === adapter.name}
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
