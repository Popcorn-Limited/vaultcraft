import { atom } from "jotai";
import { YieldOptions } from 'vaultcraft-sdk';


export const yieldOptionsAtom = atom<YieldOptions | null>(null);
