import {
  DEFAULT_PROTOCOL,
  DEFAULT_STRATEGY,
  assetAddressesAtom,
  assetAtom,
  protocolAtom,
  strategyAtom,
} from "@/lib/atoms";
import Input from "@/components/input/Input";
import Selector, { Option } from "@/components/input/Selector";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { Token } from "@/lib/types";
import { useWalletClient } from "wagmi";
import { getAssetsByChain, ZapAssetAddressesByChain } from "@/lib/constants";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

function AssetSelection() {
  const { data: walletClient } = useWalletClient();
  const chainId = walletClient?.chain.id || 1;

  const [, setStrategy] = useAtom(strategyAtom);
  const [protocol, setProtocol] = useAtom(protocolAtom);
  const [asset, setAsset] = useAtom(assetAtom);

  const [availableAssetAddresses] = useAtom(assetAddressesAtom);
  const networkAssetsAvailable =
    (availableAssetAddresses[chainId] &&
      Object.keys(availableAssetAddresses[chainId]).length > 0) ||
    false;

  const [assetsByChain, setAssetsByChain] = useState<{
    [key: number]: Token[];
  }>({});
  const [availableAssets, setAvailableAssets] = useState<Token[]>([]);

  useEffect(() => {
    async function addAssetsByChain() {
      // @ts-ignore
      const newAssets: { [key: number]: Token[] } = {
        ...availableAssets,
        [chainId]: await getAssetsByChain(chainId),
      };
      setAssetsByChain(newAssets);
      setAvailableAssets(
        newAssets[chainId].filter((asset) =>
          ZapAssetAddressesByChain[chainId].includes(asset.address)
        )
      );
    }
    if (!Object.keys(availableAssets).includes(String(chainId)))
      addAssetsByChain();
  }, [chainId]);

  const [searchTerm, setSearchTerm] = useState<string>("");

  function handleSearch() {
    const avAssets = assetsByChain[chainId].filter((item) =>
      searchTerm === ""
        ? true
        : item.address.toLowerCase().includes(searchTerm) ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.symbol.toLowerCase().includes(searchTerm)
    );

    setAvailableAssets(avAssets);
  }

  function selectAsset(newAsset: any) {
    if (asset !== newAsset) {
      setProtocol(DEFAULT_PROTOCOL);
      setStrategy(DEFAULT_STRATEGY);
    }
    setAsset(newAsset);
  }

  return (
    <Selector
      selected={asset}
      onSelect={(newAsset) => selectAsset(newAsset)}
      title="Select Asset"
      description="Choose an asset that you want to deposit into your vault and earn yield on. If you can't find your asset in the list, paste its address into the search bar to add it."
      optionalChildren={
        <div className="h-12 flex flex-row items-center">
          <div className="w-10/12">
            <Input
              onChange={(e) =>
                setSearchTerm(
                  (e.target as HTMLInputElement).value.toLowerCase()
                )
              }
              placeholder={
                networkAssetsAvailable
                  ? "Search by name, symbol or address"
                  : "Loading more assets..."
              }
              defaultValue={searchTerm}
              autoComplete="off"
              autoCorrect="off"
              disabled={!networkAssetsAvailable}
            />
          </div>
          <button
            className="w-2/12 ml-2 rounded-md border-2 border-customNeutral100 bg-customNeutral200 hover:bg-customNeutral100 h-14 justify-center"
            onClick={handleSearch}
          >
            <MagnifyingGlassIcon className="w-6 h-6 text-white mx-auto" />
          </button>
        </div>
      }
    >
      {availableAssets.length > 0 ? (
        availableAssets.map((assetIter) => (
          <Option
            // @ts-ignore
            key={`asset-selc-${assetIter.address}-${chainId}`}
            selected={asset.address === assetIter.address}
            value={assetIter}
          >
            <></>
          </Option>
        ))
      ) : (
        <p className="text-white">Asset not available...</p>
      )}
    </Selector>
  );
}

export default AssetSelection;
