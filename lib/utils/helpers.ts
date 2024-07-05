import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { Clients, SimulationResponse, Token } from "@/lib/types";
import { InitParam, InitParamRequirement } from "@/lib/atoms/adapter";
import { Abi, Address, PublicClient, formatUnits, isAddress } from "viem";
import { ADDRESS_ZERO } from "@/lib/constants";
import { numberToFormattedString, safeRound } from "./formatBigNumber";

import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function validateInput(value: string | number): {
  formatted: string;
  isValid: boolean;
} {
  const formatted =
    value === "." ? "0" : (`${value || "0"}`.replace(/\.$/, ".0") as any);
  return {
    formatted,
    isValid: value === "" || isFinite(Number(formatted)),
  };
}

interface HandleCallResultProps {
  successMessage: string;
  simulationResponse: SimulationResponse;
  clients: Clients;
}

export async function handleCallResult({
  successMessage,
  simulationResponse,
  clients,
}: HandleCallResultProps): Promise<boolean> {
  if (simulationResponse.success) {
    try {
      const hash = await clients.walletClient.writeContract(
        simulationResponse.request
      );
      const receipt = await clients.publicClient.waitForTransactionReceipt({
        hash,
      });
      showSuccessToast(successMessage);
      return true;
    } catch (error: any) {
      console.log({ error });
      showErrorToast(error.shortMessage);
      return false;
    }
  } else {
    showErrorToast(simulationResponse.error);
    return false;
  }
}

export const roundToTwoDecimalPlaces = (
  numberToRound: number,
  decimals = 2
): number =>
  Number(
    (
      Math.round(numberToRound * Math.pow(10, decimals)) /
      Math.pow(10, decimals)
    ).toFixed(decimals)
  );

export function cleanTokenName(token: Token): string {
  if (token.name.includes("Hop")) {
    return token.name.slice(0, token.name.indexOf(" LP Token"));
  } else if (token.name.includes("Curve.fi Factory USD Metapool")) {
    return token.name.slice(31);
  } else if (token.name.includes("Curve.fi Factory Pool:")) {
    return token.name.slice(23);
  } else if (token.name.includes("StableV")) {
    return token.name.slice(15);
  } else if (token.name.includes("VolatileV")) {
    return token.name.slice(17);
  }
  return token.name;
}

export function cleanTokenSymbol(token: Token): string {
  if (token.symbol.includes("HOP-LP")) {
    const split = token.symbol.split("LP-");
    return split[0] + split[1];
  } else if (token.symbol.includes("AMMV2")) {
    const split = token.symbol.split("AMMV2-");
    return split[0].slice(0, -1) + split[1];
  } else if (token.symbol.includes("AMM")) {
    const split = token.symbol.split("AMM-");
    return split[0].slice(0, -1) + split[1];
  }
  return token.symbol;
}

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
    if (
      inputParam.requirements.includes(InitParamRequirement.NotAddressZero) &&
      value !== ADDRESS_ZERO
    )
      errors.push("Must not be zero address");

    if (
      inputParam.requirements.includes(InitParamRequirement.NotZero) &&
      Number(value) === 0
    )
      errors.push("Must not be zero");
  }

  return errors;
}

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

export type SimulationContract = {
  address: Address;
  abi: Abi;
};

export interface SimulateProps {
  account: Address;
  contract: SimulationContract;
  functionName: string;
  publicClient: PublicClient;
  args?: any[];
  value?: bigint;
}

export async function simulateCall({
  account,
  contract,
  functionName,
  publicClient,
  args,
  value,
}: SimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address: contract.address,
      abi: contract.abi,
      // @ts-ignore
      functionName,
      args,
      value,
    });
    return { request: request, success: true, error: null };
  } catch (error: any) {
    console.log({ simError: error });
    return { request: null, success: false, error: error.shortMessage };
  }
}

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function handleChangeInput(e: any, setter: Function) {
  const value = e.currentTarget.value;
  setter(validateInput(value).isValid ? value : "0");
}

export function handleMaxClick(token: Token, setter: Function) {
  const formatted = numberToFormattedString(token.balance, token.decimals)
  setter(validateInput(formatted).isValid ? formatted : "0");
}
