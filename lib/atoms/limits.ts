import { BigNumber, constants } from "ethers";
import { atomWithStorage } from "jotai/utils";


export const limitAtom = atomWithStorage<BigNumber>("config.limits", constants.Zero);