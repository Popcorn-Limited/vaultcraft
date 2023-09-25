import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  adapterConfigAtom,
  assetAtom,
  networkAtom,
  Protocol,
  protocolAtom,
} from "@/lib/atoms";
import Selector, { Option } from "@/components/inputs/Selector";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { YieldOptions } from "vaultcraft-sdk";
import { Address, getAddress } from "viem";

interface ProtocolOption extends Protocol {
  disabled: boolean;
  apy?: number;
}

const ProtocolIcons = {
  aaveV2: "https://cryptologos.cc/logos/aave-aave-logo.png?v=024",
  aaveV3: "https://cryptologos.cc/logos/aave-aave-logo.png?v=024",
  aura: "https://app.aura.finance/assets/aura-362899d2.png",
  balancer: "https://cryptologos.cc/logos/balancer-bal-logo.png?v=024",
  beefy: "https://cryptologos.cc/logos/beefy-finance-bifi-logo.png?v=024",
  compoundV2: "https://cdn.furucombo.app/assets/img/token/COMP.svg",
  compoundV3: "https://cdn.furucombo.app/assets/img/token/COMP.svg",
  convex: "https://cdn.furucombo.app/assets/img/token/CVX.png",
  curve: "https://cryptologos.cc/logos/curve-dao-token-crv-logo.png?v=025",
  flux: "https://icons.llamao.fi/icons/protocols/flux-finance",
  idleJunior: "https://icons.llamao.fi/icons/protocols/idle",
  idleSenior: "https://icons.llamao.fi/icons/protocols/idle",
  origin: "https://icons.llamao.fi/icons/protocols/origin-defi",
  yearn: "https://cryptologos.cc/logos/yearn-finance-yfi-logo.png?v=024"
}

async function getProtocolOptions(asset: Address, chainId: number, yieldOptions: YieldOptions): Promise<ProtocolOption[]> {
  console.log({ asset, chainId, yieldOptions })
  const protocolNames = await yieldOptions?.getProtocolsByAsset(chainId, asset);
  console.log({ protocolNames })
  const apys = await Promise.all(protocolNames.map(async (protocol) => yieldOptions?.getApy(chainId, protocol, asset)))
  return protocolNames.map((name, i) => ({
    name,
    key: name,
    chains: [chainId],
    logoURI: ProtocolIcons[name],
    apy: apys[i].total,
    disabled: false
  }))
}

function ProtocolSelection() {
  const [yieldOptions] = useAtom(yieldOptionsAtom);

  const [network] = useAtom(networkAtom);
  const [protocol, setProtocol] = useAtom(protocolAtom);
  const [asset] = useAtom(assetAtom);

  const [options, setOptions] = useState<ProtocolOption[]>([]);

  const [, setAdapterConfig] = useAtom(adapterConfigAtom);

  useEffect(() => {
    if (network && asset.symbol !== "none" && yieldOptions) {
      setOptions([])
      getProtocolOptions(getAddress(asset.address[network.id]), 1, yieldOptions).then(res => setOptions(res));
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
      description="Select a protocol to use to earn yield. You need to select an asset first."
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