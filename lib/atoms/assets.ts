import assetsJson from "@/lib/constants/assets.json";
import { atom } from "jotai";

export type Asset = {
  chains: number[];
  address: { [key: string]: string };
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

type AssetAddresses = {
  // Chain Id
  [key: number]: {
    // Resolver string
    [key: string]: string[]
  }
}

export const assets = assetsJson as Asset[];

export const DEFAULT_ASSET: Asset = { name: "Choose an Asset", symbol: "none", decimals: 0, logoURI: "", address: {}, chains: [] }

export const assetAtom = atom<Asset>(DEFAULT_ASSET);

export const assetAddressesAtom = atom<AssetAddresses>({});

export const availableAssetsAtom = atom<Asset[]>([]);