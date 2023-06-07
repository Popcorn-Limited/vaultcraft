import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Chain } from "wagmi";
import { arbitrum, localhost } from "wagmi/chains";

export const networkAtom = atom<Chain>(arbitrum);
