import { atom } from "jotai";

export type VaultFees = {
  deposit: string;
  withdrawal: string;
  performance: string;
  management: string;
  recipient: string;
};

const DEFAULT_FEES = {
  deposit: "0",
  withdrawal: "0",
  performance: "0",
  management: "0",
  recipient: "",
};

export const feeAtom = atom<VaultFees>(DEFAULT_FEES);

