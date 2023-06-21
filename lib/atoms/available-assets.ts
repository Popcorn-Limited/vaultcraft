import { atom } from "jotai";

type Asset = {
    // Chain Id
    [key: number]: {
        // Resolver string
        [key: string]: string[]
    }
}

export const availableAssetsAtom = atom<Asset>({});