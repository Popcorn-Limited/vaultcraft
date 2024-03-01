import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  adapterConfigAtom,
  assetAtom,
  Protocol,
  protocolAtom,
} from "@/lib/atoms";
import Selector, { Option } from "@/components/input/Selector";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { YieldOptions } from "vaultcraft-sdk";
import { Address, getAddress } from "viem";
import { useWalletClient } from "wagmi";

interface ProtocolOption extends Protocol {
  disabled: boolean;
  apy?: number;
}

async function getProtocolOptions(
  asset: Address,
  chainId: number,
  yieldOptions: YieldOptions
): Promise<ProtocolOption[]> {
  const protocols = await yieldOptions?.getProtocolsByAsset({
    chainId,
    asset: getAddress(asset),
  });
  const apys = await Promise.all(
    protocols.map(async (protocol) =>
      yieldOptions?.getApy({ chainId, protocol: protocol.key, asset })
    )
  );
  return protocols.map((protocol, i) => ({
    ...protocol,
    apy: apys[i].total,
    disabled: false,
  }));
}

function ProtocolSelection() {
  const [yieldOptions] = useAtom(yieldOptionsAtom);
  const { data: walletClient } = useWalletClient();
  const chainId = walletClient?.chain.id || 1;

  const [protocol, setProtocol] = useAtom(protocolAtom);
  const [asset] = useAtom(assetAtom);

  const [loading, setLoading] = useState<boolean>(true);
  const [options, setOptions] = useState<ProtocolOption[]>([]);

  const [, setAdapterConfig] = useAtom(adapterConfigAtom);

  useEffect(() => {
    if (chainId && asset.symbol !== "none" && yieldOptions) {
      setLoading(true);
      setOptions([]);
      getProtocolOptions(getAddress(asset.address), chainId, yieldOptions).then(
        (res) => {
          setOptions(res);
          setLoading(false);
        }
      );
    }
  }, [chainId, asset]);

  function selectProtocol(newProtocol: any) {
    if (protocol !== newProtocol) {
      setAdapterConfig([]);
    }
    setProtocol(newProtocol);
  }

  if (asset.symbol === "none")
    return (
      <div className="border-2 border-[#353945] rounded-[4px] flex gap-2 w-full px-2 h-15 flex-row items-center">
        <p className="text-gray-600">Select an asset first</p>
      </div>
    );
  return (
    <Selector
      selected={protocol}
      onSelect={(newProtocol) => selectProtocol(newProtocol)}
      title="Select Protocol"
      description="Select a protocol to use to earn yield. You need to select an asset first."
    >
      {loading ? (
        <p className="text-white">Loading, please wait...</p>
      ) : (
        <>
          {options.length > 0 ? (
            options
              .filter((option) => !option.disabled)
              .sort((a, b) => (b.apy || 0) - (a.apy || 0))
              .map((option) => (
                <Option
                  key={`protocol-selc-${option.name}`}
                  value={option}
                  selected={option?.name === protocol.name}
                  disabled={option.disabled}
                  apy={option?.apy}
                >
                  <></>
                </Option>
              ))
          ) : (
            <p className="text-white">No available protocols...</p>
          )}
        </>
      )}
    </Selector>
  );
}

export default ProtocolSelection;
