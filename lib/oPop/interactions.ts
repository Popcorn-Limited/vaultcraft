import { Abi, Address, PublicClient, WalletClient, parseEther } from "viem";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { MinterAbi, OPopAbi } from "@/lib/constants";
import { getVeAddresses } from "@/lib/utils/addresses";
import { SimulationResponse } from "@/lib/types";

type SimulationContract = {
  address: Address;
  abi: Abi;
}

interface SimulateProps {
  account: Address;
  contract: SimulationContract;
  functionName: string;
  publicClient: PublicClient;
  args?: any[]
}

const { oVCX, Minter: OVCX_MINTER } = getVeAddresses()

async function simulateCall({ account, contract, functionName, publicClient, args }: SimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address: contract.address,
      abi: contract.abi,
      // @ts-ignore
      functionName,
      args
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}

type Clients = {
  publicClient: PublicClient;
  walletClient: WalletClient;
}

interface ExerciseOPopProps {
  amount: bigint;
  maxPaymentAmount: bigint;
  account: Address;
  clients: Clients
}

export async function exerciseOPop({ amount, maxPaymentAmount, account, clients }: ExerciseOPopProps) {
  const { request, success, error: simulationError } = await simulateCall({
    account,
    contract: {
      address: oVCX,
      abi: OPopAbi,
    },
    functionName: "exercise",
    publicClient: clients.publicClient,
    args: [amount, maxPaymentAmount, account]
  })

  if (success) {
    try {
      const hash = await clients.walletClient.writeContract(request)
      const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("oVCX exercised successfully!")
    } catch (error: any) {
      showErrorToast(error.shortMessage)
    }
  } else {
    showErrorToast(simulationError)
  }
}


interface ClaimOPopProps {
  gauges: Address[];
  account: Address;
  clients: Clients
}

export async function claimOPop({ gauges, account, clients }: ClaimOPopProps) {
  const { request, success, error: simulationError } = await simulateCall({
    account,
    contract: {
      address: OVCX_MINTER,
      abi: MinterAbi,
    },
    functionName: "mintMany",
    publicClient: clients.publicClient,
    args: [gauges]
  })

  if (success) {
    try {
      const hash = await clients.walletClient.writeContract(request)
      const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("oVCX Succesfully Claimed!")
    } catch (error: any) {
      showErrorToast(error.shortMessage)
    }
  } else {
    showErrorToast(simulationError)
  }
}