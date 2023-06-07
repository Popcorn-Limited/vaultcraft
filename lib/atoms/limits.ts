import { BigNumber, constants } from "ethers";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";


export const limitAtom = atom<BigNumber>(constants.Zero);