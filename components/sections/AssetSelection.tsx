import { useAtom } from "jotai";
import { arbitrum, localhost, mainnet } from "wagmi/chains";
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
      actionContent={(selected) => (
        <div className="h-12 flex flex-row items-center w-full gap-x-2">
          {selected?.logoURI && (
            <div className="w-9 h-8">
              <img
                className="object-contain w-8 h-8 rounded-full"
                alt="selected-asset"
                src={selected?.logoURI}
              />
            </div>
          )}
          <span className="text-[white] w-full flex self-center flex-row justify-start">{selected?.name || "Select Asset"}</span>
          <span className="self-center text-[white] mr-2">{`>`}</span>
        </div>
      )}
    >
      <div className="w-full h-full bg-black flex flex-col items-start gap-y-1 px-8 py-9">
        <p className="text-[white] text-2xl mb-9">Select Asset</p>
        <p className="text-[white] mb-8">Choose an asset that you want to deposit into your vault and earn yield on.</p>
        <div className="flex flex-col overflow-y-scroll scrollbar-hide w-full">
          {assets.filter(a => a.chains?.includes(chainId)).map((assetIter) => (
            <Option
              // @ts-ignore
              key={`asset-selc-${assetIter.address[String(chainId)]}`}
              selected={asset.name === assetIter.name}
              value={assetIter}
            >
            </Option>
          ))}
        </div>
      </div>
    </Selector>
  );
}

export default AssetSelection;
