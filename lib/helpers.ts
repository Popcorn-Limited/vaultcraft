import { InitParam, InitParamRequirement } from "@/lib/atoms/adapter"
import { isAddress } from "viem";
import { ADDRESS_ZERO } from "./constants";

export function noOp() { }

export const beautifyAddress = (addr: string) =>
  `${addr.slice(0, 4)}...${addr.slice(-5, 5)}`;

export function verifyInitParamValidity(
  value: string,
  inputParam: InitParam
): string[] {
  const errors: string[] = [];

  if (value === "") errors.push("Value is required");
  if (!inputParam.requirements) {
    switch (inputParam.type) {
      case "address":
        if (!isAddress(value)) errors.push("Must be a valid address");
    }
  }
  if (inputParam.requirements && inputParam.requirements.length > 0) {
    if (inputParam.requirements.includes(InitParamRequirement.NotAddressZero) &&
      value !== ADDRESS_ZERO) errors.push("Must not be zero address");

    if (inputParam.requirements.includes(InitParamRequirement.NotZero) && Number(value) === 0) errors.push("Must not be zero");
  }

  return errors;
}

export const validateInput = (value?: string | number) => {
  let formatted = String(value).replace(/[^0-9.]/g, "")
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


export function extractRevertReason(error: any): string {
  if (error.reason) {
      return error.reason;
  }

  if (error.data && error.data.message) {
      return error.data.message;
  }

  return error;
}