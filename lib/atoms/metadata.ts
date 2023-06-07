import { atomWithStorage } from "jotai/utils";

export type Metadata = {
  name: string;
  tags: string[];
};

export const VAULT_TAGS = ["stable", "lsd", "compounding", "leverage"]

// @ts-ignore
export const metadataAtom = atomWithStorage<Metadata>("config.metadata", null);
