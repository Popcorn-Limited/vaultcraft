import { atom } from "jotai";

export type Protocol = {
  name: string;
  key: string;
  logoURI: string;
};

export const DEFAULT_PROTOCOL: Protocol = {
  name: "Choose a Protocol",
  key: "none",
  logoURI: "",
};

export const protocolAtom = atom<Protocol>(DEFAULT_PROTOCOL);
