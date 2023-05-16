import Section from "@/components/content/Section";
import { Fragment } from "react";
import Image from "next/image";
import Selector, { Option } from "../Selector";
import { useAtom } from "jotai";
import { assetAtom, useAssets } from "@/lib/assets";
import { networkAtom } from "@/lib/networks";

function AssetSelection() {
  const [network] = useAtom(networkAtom);
  const chainId = network.id === 1337 ? 1 : network.id;
  const [asset, setAsset] = useAtom(assetAtom);
  const assets = useAssets();

  return (
    <Section title="Asset Selection">
      <Selector
        selected={asset}
        onSelect={setAsset}
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
        {assets.filter(a => a.chains?.includes(chainId)).map((asset) => (
          // @ts-ignore
          <Option value={asset} key={`asset-selc-${asset.address[String(chainId)]}`}>
            <figure className="relative w-6 h-6">
              <Image
                fill
                alt=""
                className="object-contain"
                src={asset.logoURI}
              />
            </figure>
            <span>{asset.name}</span>
          </Option>
        ))}
      </Selector>
    </Section>
  );
}

export default AssetSelection;
