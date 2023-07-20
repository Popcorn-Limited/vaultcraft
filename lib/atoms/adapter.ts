import { ethers } from "ethers";
import { atomWithStorage } from "jotai/utils";
import adapters from "@/lib/constants/adapters.json";
import { atom, useAtom } from "jotai";

export type Adapter = {
  name: string;
  key: string;
  logoURI: string;
  protocol: string;
  assets: string[];
  chains: number[];
  initParams?: InitParam[];
  resolver?: string;
};

export type InitParam = {
  name: string;
  type: string;
  requirements?: InitParamRequirement[];
  description?: string;
  multiple?: boolean;
};

export enum InitParamRequirement {
  "Required",
  "NotAddressZero",
  "NotZero",
}

export interface AdapterConfig {
  id: string;
  data: string;
}

export const useAdapters = () => {
  return adapters as any as Array<Adapter>;
};

export const DEFAULT_ADAPTER: Adapter = { name: "Choose an Adapter", key: "none", logoURI: "", protocol: "none", assets: [], chains: [] }

export const adapterAtom = atom<Adapter>(DEFAULT_ADAPTER);

export const adapterConfigAtom = atom<Array<string>>([]);
export const adapterDeploymentAtom = atom<AdapterConfig>({ id: ethers.utils.formatBytes32String(""), data: "0x" });