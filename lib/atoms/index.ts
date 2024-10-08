export * from "./adapter";
export * from "./assets";
export * from "./conditions";
export * from "./fees";
export * from "./limits";
export * from "./metadata";
export * from "./protocols";
export * from "./strategy";
export * from "./gauges";
export * from "./tokens";
export * from "./networth";
export * from "./vaultron";


import { atom } from "jotai";

export const valueStorageAtom = atom<number>(0);