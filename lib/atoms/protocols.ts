import { atomWithStorage } from "jotai/utils";
import protocols from "@/lib/constants/protocols.json";

export type Protocol = {
  chains: number[];
  name: string;
  logoURI: string;
};

export const useProtocols = () => {
  return protocols as any as Array<Protocol>;
};

// @ts-ignore
export const protocolAtom = atomWithStorage<Protocol>("select.protocol", null);
