import { atom } from "jotai";

export * from "./fees";
export * from "./strategy";
export * from "./gauges";
export * from "./tokens";
export * from "./networth";
export * from "./vaultron";

export const valueStorageAtom = atom<bigint>(BigInt(0));