import { Fragment, useEffect } from "react";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { Chain, useNetwork } from "wagmi";
import { useChainModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { networkAtom, assetAtom, protocolAtom, adapterAtom, adapterConfigAtom, strategyAtom } from "@/lib/atoms";
import { SUPPORTED_NETWORKS } from "@/lib/connectors";
import Selector, { Option } from "@/components/inputs/Selector";


const networkLogos = {
  1: "/images/icons/ethereum.svg",
  5: "/images/icons/testNetLogo.png",
  137: "/images/icons/polygon.svg",
  42161: "/images/icons/arbitrum.svg",
  1337: "/images/icons/testNetLogo.png",
  31338: "/images/icons/testNetLogo.png",
  10: "/images/icons/optimism-op-logo.svg",
  56: "/images/icons/bsc-logo.png",
  250: "/images/icons/fantom.png",
};

function NetworkSelection() {
  const { chain } = useNetwork();
  const { openChainModal } = useChainModal();
  const [network, setNetwork] = useAtom(networkAtom);

  // Used only to reset
  const [, setAsset] = useAtom(assetAtom);
  const [, setProtocol] = useAtom(protocolAtom);
  const [, setAdapter] = useAtom(adapterAtom);
  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [, setStrategy] = useAtom(strategyAtom);


  useEffect(() => {
    if (chain?.unsupported) {
      // Suggest to change network when not in `SUPPORTED_NETWORKS`
      return openChainModal?.();
    }

    if (network.id !== chain?.id) {
      // Propt to change network when user changes from Selection Dropdown
      openChainModal?.();
    }
  }, [chain?.unsupported, network]);

  function selectNetwork(newNetwork: any) {
    if (newNetwork !== network) {
      // setAsset(RESET);
      // setProtocol(RESET);
      // setAdapter(RESET);
      // setAdapterConfig(RESET);
      // setStrategy(RESET)
    }
    setNetwork(newNetwork)
  }

  return (
    <section>
      <Selector
        selected={network}
        onSelect={selectNetwork}
        actionContent={(selected: Chain) => (
          <Fragment>
            {selected && (
              <figure className="relative w-6 h-6">
                <Image
                  fill
                  className="object-contain"
                  alt="logo"
                  src={(networkLogos as any)[selected.id]}
                />
              </figure>
            )}
            <span>{selected?.name || "Click to select"}</span>
          </Fragment>
        )}
      >
        {SUPPORTED_NETWORKS.map((c) => (
          <Option key={`asset-selc-${c.network}`} value={c} selected={c.id === chain?.id} >
            <figure className="relative w-6 h-6">
              <Image
                fill
                alt=""
                className="object-contain"
                src={networkLogos[c.id]}
              />
            </figure>
            <span>{c.name}</span>
          </Option>
        ))}
      </Selector>
    </section>
  );
}

export default NetworkSelection;
