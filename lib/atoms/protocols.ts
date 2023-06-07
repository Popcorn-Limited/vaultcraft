import { atomWithStorage } from "jotai/utils";
import protocols from "@/lib/constants/protocols.json";
import { atom } from "jotai";

export type Protocol = {
  chains: number[];
  name: string;
  key: string;
  logoURI: string;
};

export const useProtocols = () => {
  return protocols as any as Array<Protocol>;
};

export const protocolAtom = atom<Protocol>({ name: "Choose a Protocol", key: "none", logoURI: "", chains: [] });
