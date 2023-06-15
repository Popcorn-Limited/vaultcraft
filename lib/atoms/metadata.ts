import { atom } from "jotai";

export type Metadata = {
  name: string;
  tags: string[];
  ipfsHash: string;
};

export enum VaultTag {
  deltaNeutral = "Delta Neutral",
  lsd = "LSD",
  degen = "Full Degen",
  decentralized = "Decentralization Maxi",
  wildcard = "Wildcard",
}

export const metadataAtom = atom<Metadata>({ name: "", tags: [], ipfsHash: "" });
