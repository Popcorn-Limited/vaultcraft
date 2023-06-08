import { atom } from "jotai";
import { Chain, mainnet } from "wagmi";

export const networkAtom = atom<Chain>(mainnet);
