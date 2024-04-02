import { atom } from "jotai";
import { VaultronStats } from "@/lib/types";
import { DEFAULT_VAULTRON } from "@/lib/vaultron";

export const vaultronAtom = atom<VaultronStats>(DEFAULT_VAULTRON)
