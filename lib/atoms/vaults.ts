import { atom } from "jotai";
import { LockVaultData, VaultData, VaultDataByAddress } from "@/lib/types";

export const vaultsAtom = atom<{ [key: number]: VaultData[] }>({});
export const lockvaultsAtom = atom<LockVaultData[]>([]);
