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

  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [availableAssets] = useAtom(assetAddressesAtom);
  const [asset] = useAtom(assetAtom);

  useEffect(() => {
    if (network && asset.symbol !== "none") {
      setOptions([])
      getProtocolOptions(protocols, network.id, asset.address[network.id].toLowerCase(), availableAssets[network.id]).then(res => setOptions(res));
    }
  }, [network, asset]);

  function selectProtocol(newProtocol: any) {
    if (protocol !== newProtocol) {
      setAdapterConfig([])
    }
    setProtocol(newProtocol)
  }

  if (asset.symbol === "none") return (
    <div className="border-2 border-[#353945] rounded-[4px] flex gap-2 w-full px-2 h-15 flex-row items-center">
      <p className="text-gray-600">Select an asset first</p>
    </div>)
  return (
    <Selector
      selected={protocol}
      onSelect={(newProtocol) => selectProtocol(newProtocol)}
      title="Select Protocol"
      description="Select a protocol to use to earn yield. You need to select an asset first"
    >
      {options.length > 0 ? options.filter(option => !option.disabled).sort((a, b) => (b.apy || 0) - (a.apy || 0)).map((option) => (
        <Option
          key={`protocol-selc-${option.name}`}
          value={option}
          selected={option?.name === protocol.name}
          disabled={option.disabled}
          apy={option?.apy}
        >
        </Option>
      )) : <p className="text-white">Loading, please wait...</p>}
    </Selector>
  );
}

export default ProtocolSelection;