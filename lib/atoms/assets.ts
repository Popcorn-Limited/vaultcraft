import { atom } from "jotai";
import { Address } from "viem";
import { Asset, Token } from "../types";

type AssetAddresses = {
  // Chain Id
  [key: number]: Address[]
}

export const DEFAULT_ASSET: Asset = { name: "Choose an Asset", symbol: "none", decimals: 0, logoURI: "", address: {}, chains: [] }

export const assetAtom = atom<Asset>(DEFAULT_ASSET);

export const assetAddressesAtom = atom<AssetAddresses>({});

export const availableAssetsAtom = atom<Asset[]>([]);

export const zapAssetsAtom = atom<{ [key: number]: Token[] }>({});
export const availableZapAssetAtom = atom<AssetAddresses>({})
