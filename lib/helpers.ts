import { constants, utils } from "ethers";
import { InitParam, InitParamRequirement } from "@/lib/atoms/adapter"

export function noOp() { }

export const beautifyAddress = (addr: string) =>
  `${addr.slice(0, 4)}...${addr.slice(-5, 5)}`;

export function verifyInitParamValidity(
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

export const validateBigNumberInput = (value?: string | number) => {
  const formatted =
    value === "." ? "0" : (`${value || "0"}`.replace(/\.$/, ".0") as any);
  return {
    formatted,
    isValid: value === "" || isFinite(Number(formatted)),
  };
};

export function transformNetwork(network: string | undefined): string {
  switch (network) {
    case "homestead":
    case undefined:
      return "ethereum";
    case "matic":
      return "polygon";
    default:
      return network.toLowerCase();
  }
}

export function cleanFileName(fileName: string): string {
  return fileName.replace(/ /g, "-").replace(/[^a-zA-Z0-9]/g, "");
}