import { Abi, Address, PublicClient } from "viem";
import { MinterAbi, MinterByChain, OptionTokenAbi, OptionTokenByChain } from "@/lib/constants";
import { Clients, SimulationResponse } from "@/lib/types";
import { handleCallResult } from "@/lib/utils/helpers";

type SimulationContract = {
  address: Address;
  abi: Abi;
};

interface SimulateProps {
  account: Address;
  contract: SimulationContract;
  functionName: string;
  publicClient: PublicClient;
  args?: any[];
}

async function simulateCall({
  account,
  contract,
  functionName,
  publicClient,
  args,
}: SimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address: contract.address,
      abi: contract.abi,
      // @ts-ignore
      functionName,
      args,
    });
    return { request: request, success: true, error: null };
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage };
  }
}
interface ExerciseOPopProps {
  amount: bigint;
  maxPaymentAmount: bigint;
  account: Address;
  clients: Clients;
}

export async function exerciseOPop({
  amount,
  maxPaymentAmount,
  account,
  clients,
}: ExerciseOPopProps): Promise<boolean> {
  return handleCallResult({
    successMessage: "oVCX exercised successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: OptionTokenByChain[1],
        abi: OptionTokenAbi,
      },
      functionName: "exercise",
      publicClient: clients.publicClient,
      args: [amount, maxPaymentAmount, account],
    }),
    clients,
  });
}

interface ClaimOPopProps {
  gauges: Address[];
  account: Address;
  minter: Address;
  clients: Clients
}

export async function claimOPop({ gauges, account, minter, clients }: ClaimOPopProps): Promise<boolean> {
  return handleCallResult({
    successMessage: "oVCX Succesfully Claimed!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: minter,
        abi: MinterAbi,
      },
      functionName: "mintMany",
      publicClient: clients.publicClient,
      args: [gauges],
    }),
    clients,
  });
}
