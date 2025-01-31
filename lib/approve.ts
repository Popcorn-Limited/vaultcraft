import { Address, PublicClient, WalletClient } from "viem";
import { ALT_NATIVE_ADDRESS, AsyncRouterByChain, ERC20Abi, OracleVaultAbi, POP, ZERO } from "@/lib/constants";
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toasts";
import { Clients, SimulationResponse } from "@/lib/types";
import { UsdtAbi } from "@/lib/constants/abi/USDT";
import { sendMessageToDiscord } from "@/lib/discord/discordBot";
import { handleCallResult, simulateCall } from "./utils/helpers";

interface HandleAllowanceProps {
  token: Address;
  vault?: Address;
  amount: bigint;
  account: Address;
  spender: Address;
  clients: Clients;
}

interface SimulateApproveProps {
  amount: bigint;
  address: Address;
  account: Address;
  spender: Address;
  publicClient: PublicClient;
}

interface ApproveProps extends SimulateApproveProps {
  walletClient: WalletClient;
}

// const MAX_APPROVAL_AMOUNT = BigInt(
//   "115792089237316195423570985008687907853269984665640"
// );

export async function handleAllowance({
  token,
  vault,
  amount,
  account,
  spender,
  clients,
}: HandleAllowanceProps): Promise<boolean> {
  // Set Operator if dealing with the AsyncRouter
  if (spender === AsyncRouterByChain[clients.walletClient.chain?.id ?? 1]) {
    const success = await setOperator({ account, address: vault ?? token, router: spender, clients })
    if (!success) return false
  }

  // Native Token cant be approved
  if (token === ALT_NATIVE_ADDRESS) {
    return true
  }

  const fetchAllowance = async () => {
    return await clients.publicClient.readContract({
      address: token,
      abi: ERC20Abi,
      functionName: "allowance",
      args: [account, spender],
    });
  };
  let allowance = await fetchAllowance();

  // approve precise amount
  if (allowance === BigInt(0)) {
    await approve({
      amount,
      address: token,
      account,
      spender,
      publicClient: clients.publicClient,
      walletClient: clients.walletClient,
    });
  } else if (allowance < amount) {
    // We need to zero the allowance first with POP
    if (token === POP) {
      await approve({
        amount: ZERO,
        address: token,
        account,
        spender,
        publicClient: clients.publicClient,
        walletClient: clients.walletClient,
      });
    }

    await approve({
      amount: amount,
      address: token,
      account,
      spender,
      publicClient: clients.publicClient,
      walletClient: clients.walletClient,
    });
  } else {
    return true;
  }

  allowance = await fetchAllowance();
  return Number(allowance) >= amount;
}

export default async function approve({
  amount,
  address,
  account,
  spender,
  publicClient,
  walletClient,
}: ApproveProps): Promise<boolean> {
  showLoadingToast("Approving token...");

  const {
    request,
    success,
    error: simulationError,
  } = await simulateApprove({
    amount: amount * BigInt(110) / BigInt(100),
    address,
    account,
    spender,
    publicClient,
  });
  if (success) {
    try {
      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      showSuccessToast("Approved token!");
      return true;
    } catch (error: any) {
      await sendMessageToDiscord({
        chainId: publicClient.chain?.id ?? 0,
        target: address,
        user: account,
        isSimulation: false,
        method: "approve",
        reason: error.shortMessage ?? "",
        args: [...request.args]
      });

      showErrorToast(error.shortMessage);
      return false;
    }
  } else {
    await sendMessageToDiscord({
      chainId: publicClient.chain?.id ?? 0,
      target: address,
      user: account,
      isSimulation: true,
      method: "approve",
      reason: simulationError ?? "",
    });

    showErrorToast(simulationError);
    return false;
  }
}

async function setOperator({ account, address, router, clients }: { account: Address, address: Address, router: Address, clients: Clients }) {
  const isOperator = await clients.publicClient.readContract({
    address: address,
    abi: OracleVaultAbi,
    functionName: "isOperator",
    args: [account, router]
  })
  let success = true;
  if (!isOperator) {
    success = await handleCallResult({
      successMessage: "Operator set!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: address,
          abi: OracleVaultAbi,
        },
        functionName: "setOperator",
        publicClient: clients.publicClient,
        args: [router, true]
      }),
      clients,
    });
  }
  return success
}


async function simulateApprove({
  amount,
  address,
  account,
  spender,
  publicClient,
}: SimulateApproveProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      // @ts-ignore -- for some reason viem is not happy when the two abis are slightly different
      abi:
        address === "0xdAC17F958D2ee523a2206206994597C13D831ec7"
          ? UsdtAbi
          : ERC20Abi, // USDT doesnt return a bool on approval
      functionName: "approve",
      args: [spender, amount],
    });
    return { request: request, success: true, error: null };
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage };
  }
}
