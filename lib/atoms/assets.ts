import { atom } from "jotai";
import { Address, zeroAddress } from "viem";
import { Asset, Token } from "../types";

type AssetAddresses = {
  // Chain Id
  [key: number]: Address[]
}

export const DEFAULT_ASSET: Token = { name: "Choose an Asset", symbol: "none", decimals: 0, logoURI: "", address: zeroAddress, balance: 0, price: 0 }

export const assetAtom = atom<Token>(DEFAULT_ASSET);

export const assetAddressesAtom = atom<AssetAddresses>({});

export const availableAssetsAtom = atom<Asset[]>([]);

export const zapAssetsAtom = atom<{ [key: number]: Token[] }>({});
export const availableZapAssetAtom = atom<AssetAddresses>({})
