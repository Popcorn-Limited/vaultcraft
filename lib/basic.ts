import { atomWithStorage } from "jotai/utils";
import { Asset } from "./assets";
import { Protocol } from "./protocols";
import { Adapter } from "./adapter";
import { Strategy } from "./strategy";

export type Basics = {
    name: string;
    asset: Asset;
    protocol: Protocol;
    adapter: Adapter;
    strategy: Strategy;
};

// @ts-ignore
export const basicAtom = atomWithStorage<Basics>("select.basic",
    {
        name: '',
        asset: {},
        protocol: {},
        adapter: {},
        strategy: {}
    });
