import { showErrorToast, showSuccessToast } from "../toasts";
import { Clients, SimulationResponse, Token } from "../types";

export function validateInput(value: string | number): { formatted: string, isValid: boolean } {
  const formatted = value === "." ? "0" : (`${value || "0"}`.replace(/\.$/, ".0") as any);
  return {
    formatted,
    isValid: value === "" || isFinite(Number(formatted)),
  };
};

interface HandleCallResultProps {
  successMessage: string;
  simulationResponse: SimulationResponse;
  clients: Clients;
}

export async function handleCallResult({ successMessage, simulationResponse, clients }: HandleCallResultProps): Promise<boolean> {
  if (simulationResponse.success) {
    try {
      const hash = await clients.walletClient.writeContract(simulationResponse.request)
      const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast(successMessage)
      return true;
    } catch (error: any) {
      showErrorToast(error.shortMessage)
      return false;
    }
  } else {
    showErrorToast(simulationResponse.error)
    return false;
  }
}

export const roundToTwoDecimalPlaces = (numberToRound: number, decimals = 2): number => Number((Math.round(numberToRound * Math.pow(10, decimals)) / Math.pow(10, decimals)).toFixed(decimals));


export function cleanTokenName(token: Token): string {
  if (token.name.includes("Hop")) {
    return token.name.slice(0, token.name.indexOf(" LP Token"))
  }
  else if (token.name.includes("Curve.fi Factory USD Metapool")) {
    return token.name.slice(31)
  }
  else if (token.name.includes("Curve.fi Factory Pool:")) {
    return token.name.slice(23)
  }
  else if (token.name.includes("StableV")) {
    return token.name.slice(15)
  }
  else if (token.name.includes("VolatileV")) {
    return token.name.slice(17)
  }
  return token.name
}

export function cleanTokenSymbol(token: Token): string {
  if (token.symbol.includes("HOP-LP")) {
    const split = token.symbol.split("LP-")
    return split[0] + split[1]
  }
  else if (token.symbol.includes("AMMV2")) {
    const split = token.symbol.split("AMMV2-")
    return split[0].slice(0, -1) + split[1]
  }
  else if (token.symbol.includes("AMM")) {
    const split = token.symbol.split("AMM-")
    return split[0].slice(0, -1) + split[1]
  }
  return token.symbol
}