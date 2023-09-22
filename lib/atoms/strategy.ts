import { AdapterConfig, InitParam } from "./adapter";
import strategies from "@/lib/constants/strategies.json";
import { atom } from "jotai";
import { stringToHex } from "viem";

export type Strategy = {
  name: string;
  key: string;
  logoURI: string;
  protocol: string;
  description: string;
  chains: number[];
  initParams?: InitParam[];
  resolver?: string;
  adapter?: string;
};

export const useStrategies = () => {
  return strategies as any as Array<Strategy>;
};

export const DEFAULT_STRATEGY = {
  name: "Choose a Strategy",
  key: "none",
  description: "none",
  logoURI: "",
  protocol: "none",
  chains: [1]
};

export const strategyAtom = atom<Strategy>(DEFAULT_STRATEGY);

export const strategyConfigAtom = atom<any[]>([]);
export const strategyDeploymentAtom = atom<AdapterConfig>({ id: stringToHex("", { size: 32 }), data: "0x" });