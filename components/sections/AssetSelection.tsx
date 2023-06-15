import { useAtom } from "jotai";
import { localhost, mainnet } from "wagmi/chains";
import { assetAtom, useAssets, networkAtom, adapterAtom, adapterConfigAtom, strategyAtom, DEFAULT_ADAPTER, DEFAULT_STRATEGY, protocolAtom, DEFAULT_PROTOCOL } from "@/lib/atoms";
import Selector, { Option } from "@/components/inputs/Selector";

function AssetSelection() {
  const [network] = useAtom(networkAtom);
  const chainId = network.id === localhost.id ? mainnet.id : network.id;

  const [asset, setAsset] = useAtom(assetAtom);
  const assets = useAssets();

  // Only for reset
  const [, setAdapter] = useAtom(adapterAtom);
  const [, setAdapterConfig] = useAtom(adapterConfigAtom);
  const [, setStrategy] = useAtom(strategyAtom);
  const [, setProtocol] = useAtom(protocolAtom);


  function selectAsset(newAsset: any) {
    if (asset !== newAsset) {
      setProtocol(DEFAULT_PROTOCOL)
      setAdapter(DEFAULT_ADAPTER)
      setAdapterConfig([])
      setStrategy(DEFAULT_STRATEGY)
    }
    setAsset(newAsset)
  }

  return (
    <Selector
      selected={asset}
      onSelect={(newAsset) => selectAsset(newAsset)}
      title="Select Asset"
      description="Choose an asset that you want to deposit into your vault and earn yield on."
    >
      {assets.filter(a => a.chains?.includes(chainId)).map((assetIter) => (
        <Option
          // @ts-ignore
          key={`asset-selc-${assetIter.address[String(chainId)]}`}
          selected={asset.name === assetIter.name}
          value={assetIter}
        >
        </Option>
      ))}
    </Selector >
  );
}

export default AssetSelection;
