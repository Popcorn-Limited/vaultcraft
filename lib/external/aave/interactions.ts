import { showLoadingToast } from "@/lib/toasts";
import { Clients, SimulationResponse } from "@/lib/types";
import { Address, maxUint256, PublicClient } from "viem";
import { handleCallResult } from "@/lib/utils/helpers";
import { AavePoolAbi } from "@/lib/constants/abi/Aave";
import { AavePoolByChain } from ".";

interface AavePoolProps {
  asset: Address;
  amount: number;
  onBehalfOf: Address;
  chainId: number;
  account: Address
  clients: Clients
}

interface BaseSimulateProps {
  address: Address;
  account: Address;
  functionName: string;
  publicClient: PublicClient;
}

interface AavePoolSimulateProps extends BaseSimulateProps {
  args: any[];
}

async function simulateAavePoolCall({ address, account, args, functionName, publicClient }: AavePoolSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: AavePoolAbi,
      // @ts-ignore
      functionName,
      // @ts-ignore
      args
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}



export async function supplyToAave({ asset, amount, onBehalfOf, chainId, account, clients }: AavePoolProps): Promise<boolean> {
  showLoadingToast("Supplying to Aave...")

  return await handleCallResult({
    successMessage: "Supplied underlying asset into Aave pool!",
    simulationResponse: await simulateAavePoolCall({
      address: AavePoolByChain[chainId],
      account,
      args: [asset, amount, onBehalfOf, 0],
      functionName: "supply",
      publicClient: clients.publicClient
    }),
    clients
  })
}

export async function withdrawFromAave({ asset, amount, onBehalfOf, chainId, account, clients }: AavePoolProps): Promise<boolean> {
  showLoadingToast("Withdrawing from Aave...")

  return await handleCallResult({
    successMessage: "Withdrew underlying asset from Aave pool!",
    simulationResponse: await simulateAavePoolCall({
      address: AavePoolByChain[chainId],
      account,
      args: [asset, amount, onBehalfOf],
      functionName: "withdraw",
      publicClient: clients.publicClient
    }),
    clients
  })
}

export async function borrowFromAave({ asset, amount, onBehalfOf, chainId, account, clients }: AavePoolProps): Promise<boolean> {
  showLoadingToast("Borrowing from Aave...")

  console.log({ asset, amount, onBehalfOf, chainId, account, pool: AavePoolByChain[chainId], clients })

  return await handleCallResult({
    successMessage: "Borrowed underlying asset from Aave pool!",
    simulationResponse: await simulateAavePoolCall({
      address: AavePoolByChain[chainId],
      account,
      args: [asset, amount, 2, 0, onBehalfOf],
      functionName: "borrow",
      publicClient: clients.publicClient
    }),
    clients
  })
}

export async function repayToAave({ asset, amount, onBehalfOf, chainId, account, clients }: AavePoolProps): Promise<boolean> {
  showLoadingToast("Repaying Aave...")

  return await handleCallResult({
    successMessage: "Repayed underlying asset for Aave pool!",
    simulationResponse: await simulateAavePoolCall({
      address: AavePoolByChain[chainId],
      account,
      args: [asset, amount === Number(maxUint256) ? maxUint256 : amount, 2, onBehalfOf],
      functionName: "repay",
      publicClient: clients.publicClient
    }),
    clients
  })
}