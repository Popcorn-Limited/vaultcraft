import protocols from "@/lib/constants/protocols.json";
import { atom } from "jotai";

export type Protocol = {
  chains: number[];
  name: string;
  key: string;
  logoURI: string;
};

export const useProtocols = () => {
  return protocols as Array<Protocol>;
};

export const DEFAULT_PROTOCOL: Protocol = { name: "Choose a Protocol", key: "none", logoURI: "", chains: [] }

export const protocolAtom = atom<Protocol>(DEFAULT_PROTOCOL);
