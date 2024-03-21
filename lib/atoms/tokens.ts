import { atom } from "jotai";
import { TokenByAddress } from "@/lib/types";

export const tokensAtom = atom<{ [key: number]: TokenByAddress }>({})
