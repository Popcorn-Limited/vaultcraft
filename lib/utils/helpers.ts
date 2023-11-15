import { showErrorToast, showSuccessToast } from "../toasts";
import { Clients, SimulationResponse } from "../types";

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