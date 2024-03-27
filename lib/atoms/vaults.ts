import { atom } from "jotai";
import { VaultData } from "@/lib/types";

export const vaultsAtom = atom<{ [key: number]: VaultData[] }>({});
