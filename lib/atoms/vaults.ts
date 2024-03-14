import { atom } from "jotai";
import { LockVaultData, VaultData } from "@/lib/types";

export const vaultsAtom = atom<VaultData[]>([]);
export const lockvaultsAtom = atom<LockVaultData[]>([]);
