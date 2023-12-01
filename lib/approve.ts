import { Address, PublicClient, WalletClient, getAddress } from "viem"
import { ERC20Abi } from "@/lib/constants"
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts"
import { Clients, SimulationResponse, Token } from "@/lib/types";
import { UsdtAbi } from "./constants/abi/USDT";

interface HandleAllowanceProps {
  token: Address;
  amount: number;
  account: Address;
  spender: Address;
  clients: Clients;
}

interface SimulateApproveProps {
  address: Address;
  account: Address;
  spender: Address;
  publicClient: PublicClient;
}

interface ApproveProps extends SimulateApproveProps {
  walletClient: WalletClient;
}

export async function handleAllowance({ token, amount, account, spender, clients }: HandleAllowanceProps): Promise<boolean> {
  const allowance = await clients.publicClient.readContract({
    address: token,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [account, spender]
  })

  if (Number(allowance) === 0 || Number(allowance) < amount) {
    return approve({ address: token, account, spender, publicClient: clients.publicClient, walletClient: clients.walletClient })
  }
  return true
}

export default async function approve({ address, account, spender, publicClient, walletClient }: ApproveProps): Promise<boolean> {
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
      // @ts-ignore -- for some reason viem is not happy when the two abis are slightly different
      abi: address === "0xdAC17F958D2ee523a2206206994597C13D831ec7" ? UsdtAbi : ERC20Abi, // USDT doesnt return a bool on approval
      functionName: 'approve',
      args: [spender, BigInt("115792089237316195423570985008687907853269984665640")]
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}