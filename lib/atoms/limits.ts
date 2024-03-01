import { atom } from "jotai";

export type Limits = {
  minimum: string; // Minimum doesnt exist yet
  maximum: string;
};

export const limitAtom = atom<Limits>({
  minimum: "0",
  maximum: "0",
});
