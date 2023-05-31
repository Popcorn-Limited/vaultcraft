import { atomWithStorage } from "jotai/utils";
import adapters from "./constants/adapters.json";
import { constants, ethers, utils } from "ethers";

export type Adapter = {
  name: string;
  key: string;
  logoURI: string;
  protocol: string;
  assets: string[];
  initParams?: InitParam[];
  resolver?: string;
};

export type InitParam = {
  name: string;
  type: string;
  requirements?: InitParamRequirement[];
  description?: string;
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

// @ts-ignore
export const adapterAtom = atomWithStorage<Adapter>("select.adapter", null);

export const adapterConfigAtom = atomWithStorage<Array<string>>(
  "config.adapter",
  []
);
export const adapterDeploymentAtom = atomWithStorage<AdapterConfig>(
  "deploy.adapter",
  { id: ethers.utils.formatBytes32String(""), data: "0x" }
);

export function checkInitParamValidity(
  value: any,
  inputParam: InitParam
): boolean {
  if (!value) return false;
  if (!inputParam?.requirements) {
    switch (inputParam.type) {
      case "address":
        return utils.isAddress(value);
      case "uint256":
      default:
        return true;
    }
  }
  if (inputParam.requirements.includes(InitParamRequirement.NotAddressZero)) {
    return utils.isAddress(value) && value !== constants.AddressZero;
  }
  if (inputParam.requirements.includes(InitParamRequirement.NotZero)) {
    return value > 0;
  }

  return true;
}
