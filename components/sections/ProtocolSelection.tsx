import axios from "axios";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { Adapter, adapterConfigAtom, useAdapters, assetAtom, networkAtom, Protocol, protocolAtom, useProtocols, adapterAtom, DEFAULT_ADAPTER } from "@/lib/atoms";
import { resolveProtocolAssets } from "@/lib/resolver/protocolAssets/protocolAssets";
import Selector, { Option } from "@/components/inputs/Selector";
import { ChainId, networkMap } from "@/lib/connectors";

interface ProtocolOption extends Protocol {
  disabled: boolean;
  apy?: string | number;
}

type Pool = {
  apy: number
  chain: string
  project: string
  underlyingTokens: string[]
}

const poolNetworkMap = {
  ...networkMap,
  [ChainId.BNB]: "BSC",
}

async function assetSupported(protocol: Protocol, adapters: Adapter[], chainId: number, asset: string): Promise<boolean> {
  const availableAssets = await Promise.all(adapters.filter(
    (adapter) => adapter.protocol === protocol.key
  ).filter(adapter => adapter.chains.includes(chainId)).map(adapter => resolveProtocolAssets({ chainId: chainId, resolver: adapter.resolver })
  ))

  return availableAssets.flat().map(a => a?.toLowerCase()).filter((availableAsset) => availableAsset === asset).length > 0
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
  const [pools, setPools] = useState<Pool[]>([]);

  async function getPools() {
    try {
      const { data } = await axios.get<{
        data: Pool[]
      }>('https://yields.llama.fi/pools')

      setPools(data.data)
    } catch (e) {
      console.error(e)
    }
  }

  async function getProtocolOptions(protocols: Protocol[], adapters: Adapter[], chainId: number, asset: string): Promise<ProtocolOption[]> {
    return Promise.all(protocols.filter(
        (p) => p.chains.includes(chainId)).map(
        async (p) => {
          const disabled = !(await assetSupported(p, adapters, chainId, asset))
          return {
            ...p,
            disabled,
            ...(pools.length && !disabled && { apy:
                  pools
                  .filter(
                      pool => pool.chain === poolNetworkMap[network.id as keyof typeof poolNetworkMap] && pool.project.includes(p.key)
                  )
                  .reduce((avg, val, _, { length }) => avg + val.apy / length, 0)
                  .toFixed(2)
            })
          }
        })
    )
  }

  useEffect(() => {
    if(!pools.length) {
      getPools()
    }
    if (network && asset.symbol !== "none") {
      getProtocolOptions(protocols, adapters, network.id, asset.address[network.id].toLowerCase()).then(res => setOptions(res));
    }
  }, [network, asset]);

  useEffect(() => {
    if(!options.length) return

    setOptions(options.map(option => {
      return {
        ...option,
        apy: pools
            .filter(
                pool => pool.chain === poolNetworkMap[network.id as keyof typeof poolNetworkMap] && pool.project.includes(option.key)
            )
            .reduce((avg, val, _, { length }) => avg + val.apy / length, 0)
            .toFixed(2)
      }
    }))
  }, [pools])

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
            apy={protocolIter?.apy}
          >
          </Option>
        )) : <p className="text-white">Loading, please wait...</p>}
      </Selector>
    </section>
  );
}

export default ProtocolSelection;
