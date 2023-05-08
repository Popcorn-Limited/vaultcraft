import { Fragment, useEffect } from "react";
import { networkAtom } from "@/lib/networks";
import { useAtom } from "jotai";
import { Chain, useNetwork } from "wagmi";
import { useChainModal } from "@rainbow-me/rainbowkit";

import Section from "@/components/content/Section";
import Image from "next/image";
import Selector, { Option } from "@/components/Selector";
import { SUPPORTED_NETWORKS } from "pages/_app";

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

  useEffect(() => {
    if (chain?.unsupported) {
      // Suggest to change network when not in `SUPPORTED_NETWORKS`
      return openChainModal?.();
    }

    if (network?.id !== chain?.id) {
      // Propt to change network when user changes from Selection Dropdown
      openChainModal?.();
    }
  }, [chain?.unsupported, network]);

  return (
    <Section title="Network Selection">
      <Selector
        selected={network}
        onSelect={setNetwork}
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
        {SUPPORTED_NETWORKS.map((chain) => (
          <Option value={chain} key={`asset-selc-${chain.network}`}>
            <figure className="relative w-6 h-6">
              <Image
                fill
                alt=""
                className="object-contain"
                src={networkLogos[chain.id]}
              />
            </figure>
            <span>{chain.name}</span>
          </Option>
        ))}
      </Selector>
    </Section>
  );
}

export default NetworkSelection;
