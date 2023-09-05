import axios from "axios";
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
import { resolveAdapterApy } from "@/lib/resolver/adapterApy/adapterApy";

interface ProtocolOption extends Protocol {
  disabled: boolean;
  apy?: number;
}

async function assetSupported(protocol: Protocol, chainId: number, asset: string, availableAssets: any): Promise<boolean> {
  if (!availableAssets[chainId] || Object.keys(availableAssets[chainId]).length === 0) {
    console.log("if")
    const availableAssets = await resolveProtocolAssets({ chainId: chainId, resolver: protocol.key })

    return availableAssets.flat().map(a => a?.toLowerCase()).filter((availableAsset) => availableAsset === asset).length > 0
  }

  return (
    availableAssets[chainId][protocol.key]
      ?.map((a: any) => a.toLowerCase())
      ?.filter((availableAsset: any) => availableAsset === asset)
      ?.length > 0
  )
}

async function getProtocolOptions(protocols: Protocol[], chainId: number, asset: string, availableAssets: any): Promise<ProtocolOption[]> {
  return Promise.all(protocols.filter(
    (p) => p.chains.includes(chainId)).map(
      async (p) => {
        const isAssetSupported = await assetSupported(p, chainId, asset, availableAssets)
        const protocolOption: ProtocolOption = { ...p, disabled: !isAssetSupported }
        if (isAssetSupported) protocolOption.apy = await resolveAdapterApy({ chainId: chainId, address: asset, resolver: p.key })
        return protocolOption
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
  const [availableAssets] = useAtom(assetAddressesAtom);
  const [asset] = useAtom(assetAtom);

  useEffect(() => {
    if (network && asset.symbol !== "none") {
      getProtocolOptions(protocols, network.id, asset.address[network.id].toLowerCase(), availableAssets[network.id]).then(res => setOptions(res));
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
  );
}

export default ProtocolSelection;