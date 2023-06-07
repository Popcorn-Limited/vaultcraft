import { atomWithStorage } from "jotai/utils";
import { InitParam } from "./adapter";
import strategies from "@/lib/constants/strategies.json";
import { atom } from "jotai";

export const DEFAULT_STRATEGY = {
  name: "Strategy",
  key: "strategy",
  description: "Strategy",
  compatibleAdapters: [],
};

export type Strategy = {
  name: string;
  key: string;
  description: string;
  compatibleAdapters: string[];
  initParams?: InitParam[];
};

export const useStrategies = () => {
  return strategies as any as Array<Strategy>;
};

export const strategyAtom = atom<Strategy>(DEFAULT_STRATEGY);
