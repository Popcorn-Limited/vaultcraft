import { useAtom } from "jotai";
import { arbitrum, localhost } from "wagmi/chains";
import { assetAtom, useAssets, networkAtom } from "@/lib/atoms";
import Selector, { Option } from "@/components/inputs/Selector";

function AssetSelection() {
  const [network] = useAtom(networkAtom);
  const chainId = network.id === localhost.id ? arbitrum.id : network.id;
  const [asset, setAsset] = useAtom(assetAtom);
  const assets = useAssets();

  return (
    <Selector
      selected={asset}
      onSelect={setAsset}
      actionContent={(selected) => (
        <div className="h-12 flex flex-row items-center w-full gap-x-2">
          {selected?.logoURI && (
            <figure className="h-12 py-2 flex-row items-center flex relative">
              <img
                className="object-contain h-full w-fit"
                alt="logo"
                src={selected?.logoURI}
              />
            </figure>
          )}
          <span className="text-[white] w-full flex self-center flex-row justify-start">{selected?.name || "Select Asset"}</span>
          <span className="self-center text-[white] mr-2">{`>`}</span>
        </div>
      )}
    >
      <div className="w-full h-full bg-black flex flex-col items-start gap-y-1 px-8 py-9">
        <p className="text-[white] text-2xl mb-9">Select Asset</p>
        <p className="text-[white] mb-8">The denomination asset is the asset in which depositors deposit into your vault and which the vault’s share price and the performance are measured</p>
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
