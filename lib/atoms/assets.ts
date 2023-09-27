import assetsJson from "@/lib/constants/assets.json";
import { atom } from "jotai";
import { Address } from "viem";

export type Asset = {
  chains: number[];
  address: { [key: string]: string };
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  apy?: number;
};

type AssetAddresses = {
  // Chain Id
  [key: number]: Address[]
}

export const assets = assetsJson as Asset[];

export const DEFAULT_ASSET: Asset = { name: "Choose an Asset", symbol: "none", decimals: 0, logoURI: "", address: {}, chains: [] }

export const assetAtom = atom<Asset>(DEFAULT_ASSET);

export const assetAddressesAtom = atom<AssetAddresses>({});

export const availableAssetsAtom = atom<Asset[]>([]);