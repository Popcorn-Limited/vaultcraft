import { Address, PublicClient, WalletClient } from "viem"
import { ERC20Abi } from "@/lib/constants"
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts"
import { SimulationResponse, Token } from "@/lib/types";

interface HandleAllowanceProps {
  token: Address;
  inputAmount: number;
  account: Address;
  spender: Address;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

interface SimulateApproveProps {
  address: Address;
  account: Address;
  spender: Address;
  publicClient: PublicClient;
}

interface ApprovePops extends SimulateApproveProps {
  walletClient: WalletClient;
}

export async function handleAllowance({ token, inputAmount, account, spender, publicClient, walletClient }: HandleAllowanceProps): Promise<boolean> {
  const allowance = await publicClient.readContract({
    address: token,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [account, spender]
  })

  if (Number(allowance) === 0 || Number(allowance) < inputAmount) {
    return approve({ address: token, account, spender, publicClient, walletClient })
  }
  return true
}

export default async function approve({ address, account, spender, publicClient, walletClient }: ApprovePops): Promise<boolean> {
  showLoadingToast("Approving assets for deposit...")

  const { request, success, error: simulationError } = await simulateApprove({ address, account, spender, publicClient })
  if (success) {
    try {
      const hash = await walletClient.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Approved assets for deposit!")
      return true;
    } catch (error: any) {
      showErrorToast(error.shortMessage)
      return false;
    }
  } else {
    showErrorToast(simulationError)
    return false;
  }
};

async function simulateApprove({ address, account, spender, publicClient }: SimulateApproveProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: ERC20Abi,
      functionName: 'approve',
      args: [spender, BigInt("115792089237316195423570985008687907853269984665640")]
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}