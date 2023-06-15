import { atomWithStorage } from "jotai/utils";
import assets from "@/lib/constants/assets.json";
import { atom } from "jotai";

export type Asset = {
  chains: number[];
  address: { [key: string]: string };
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

export const useAssets = () => {
  return assets;
};

export const DEFAULT_ASSET: Asset = { name: "Choose an Asset", symbol: "none", decimals: 0, logoURI: "", address: {}, chains: [] }

export const assetAtom = atom<Asset>(DEFAULT_ASSET);
