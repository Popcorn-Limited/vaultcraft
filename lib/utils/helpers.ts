import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toasts";
import { Balance, Clients, SimulationResponse, Token } from "@/lib/types";
import { Abi, Address, PublicClient, isAddress } from "viem";
import { sendMessageToDiscord } from "@/lib/discord/discordBot";
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
    console.log("SIMULATION ERROR");
    // await sendMessageToDiscord({
    //   chainId: publicClient.chain?.id ?? 0,
    //   target: contract.address,
    //   user: account,
    //   isSimulation: true,
    //   method: functionName,
    //   reason: error.shortMessage ?? "",
    //   args
    // });
    return { request: null, success: false, error: error.shortMessage };
  }
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
      console.log("CALL ERROR");

      // await sendMessageToDiscord({
      //   chainId: clients.publicClient.chain?.id ?? 0,
      //   target: simulationResponse.request?.address ?? "0x",
      //   user: simulationResponse.request?.account.address ?? "0x",
      //   isSimulation: false,
      //   method: simulationResponse.request?.functionName ?? "",
      //   reason: error.shortMessage ?? "",
      //   args: simulationResponse.request.args ? [...simulationResponse.request.args] : [],
      // });

      showErrorToast(error.shortMessage);
      return false;
    }
  } else {
    // already sent the discord message on the simulation
    showErrorToast(simulationResponse.error);
    return false;
  }
}

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function noOp() {}

export const beautifyAddress = (addr: string) =>
  `${addr.slice(0, 4)}...${addr.slice(-5, 5)}`;

export function extractRevertReason(error: any): string {
  if (error.reason) {
    return error.reason;
  }

  if (error.data && error.data.message) {
    return error.data.message;
  }

  return error;
}

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

export function handleChangeInput(e: any, setter: Function) {
  const value = e.currentTarget.value;
  setter(validateInput(value).isValid ? value : "0");
}

export function handleMaxClick(token: Token, setter: Function) {
  setter(
    validateInput(token.balance.formatted).isValid
      ? token.balance.formatted
      : "0"
  );
}

export async function handleSwitchChain(
  chainId: number,
  switchChainAsync: Function
) {
  showLoadingToast("Switching chain..");
  try {
    await switchChainAsync?.({ chainId: Number(chainId) });
    showSuccessToast("Success");
  } catch (error) {
    showErrorToast("Failed switching chain");
    return;
  }
}

export const NumberFormatter = Intl.NumberFormat("en", {
  //@ts-ignore
  notation: "compact",
});

export const formatBalance = (
  value: bigint | number,
  decimals: number,
  fixed?: number
): string => {
  if ((typeof value === "number" && isNaN(Number(value))) || isNaN(decimals))
    return "0";

  const bigValue =
    typeof value === "bigint" ? value : BigInt(Math.floor(Number(value)));
  const divisor = BigInt(10 ** decimals);
  const displayValue = bigValue / divisor;
  const fraction = bigValue % divisor;

  if (fraction === BigInt(0) && fixed === undefined) {
    return `${displayValue}`;
  }

  let fractionStr = fraction.toString().padStart(decimals, "0");
  if (fixed === undefined) {
    return `${displayValue}.${fractionStr.replace(/0+$/, "")}`;
  }
  fractionStr = fractionStr.substring(0, fixed).padEnd(fixed, "0");
  return `${displayValue}.${fractionStr}`;
};

export function formatBalanceUSD(
  balance: bigint,
  decimals: number,
  price: number,
  fixed?: number
): string {
  const formatted = formatBalance(balance, decimals, fixed);
  return String(Number(formatted) * price);
}

export function calcBalance(
  balance: bigint,
  decimals: number,
  price: number,
  fixed?: number
): Balance {
  const formatted = formatBalance(balance, decimals, fixed);
  const formattedUSD = String(Number(formatted) * price);
  return {
    value: balance,
    formatted,
    formattedUSD,
  };
}

export const EMPTY_BALANCE: Balance = {
  value: BigInt(0),
  formatted: "0",
  formattedUSD: "0",
};

export function returnBigIntResult(response: any): bigint {
  return response.status === "success" ? response.result : BigInt(0);
}

export function daysDifferenceUTC(date1: Date, date2: Date): number {
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}
