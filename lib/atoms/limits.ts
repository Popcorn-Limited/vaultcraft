import { BigNumber, constants } from "ethers";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type Limits = {
  minimum: BigNumber;
  maximum: BigNumber;
}

export const limitAtom = atom<Limits>({
  minimum: constants.Zero,
  maximum: constants.Zero,
});