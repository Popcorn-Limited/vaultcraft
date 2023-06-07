import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type Metadata = {
  name: string;
  tags: string[];
  ipfsHash: string;
};

export const VAULT_TAGS = ["stable", "lsd", "compounding", "leverage"]

export const metadataAtom = atom<Metadata>({ name: "", tags: [], ipfsHash: "" });
