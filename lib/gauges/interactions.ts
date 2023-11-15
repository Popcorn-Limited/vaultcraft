import { Abi, Address, PublicClient, WalletClient, parseEther, zeroAddress } from "viem";
import { VaultData } from "@/lib/types";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts";
import { SimulationResponse } from "@/lib/types";
import { getVeAddresses } from "@/lib/utils/addresses";
import { GaugeAbi, GaugeControllerAbi, VotingEscrowAbi } from "@/lib/constants";
import { handleCallResult } from "../utils/helpers";

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

const { GaugeController: GAUGE_CONTROLLER, VotingEscrow: VOTING_ESCROW } = getVeAddresses()

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

interface SendVotesProps {
  vaults: VaultData[];
  votes: number[];
  account: Address;
  clients: Clients;
}

export async function sendVotes({ vaults, votes, account, clients }: SendVotesProps): Promise<boolean> {
  showLoadingToast("Sending votes...")

  let addr = new Array<string>(8);
  let v = new Array<number>(8);

  for (let i = 0; i < Math.ceil(vaults.length / 8); i++) {
    addr = [];
    v = [];

    for (let n = 0; n < 8; n++) {
      const l = i * 8;
      v[n] = votes[n + l] === undefined ? 0 : votes[n + l];
      addr[n] = vaults[n + l] === undefined || votes[n + l] === 0 ? zeroAddress : vaults[n + l].gauge?.address as Address;

    }

    const success = await handleCallResult({
      successMessage: "Voted for gauges!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: GAUGE_CONTROLLER,
          abi: GaugeControllerAbi,
        },
        functionName: "vote_for_many_gauge_weights",
        publicClient: clients.publicClient,
        args: [addr, v]
      }),
      clients
    })
    if (!success) return false
  }
  return true
}

interface CreateLockProps {
  amount: number | string;
  days: number;
  account: Address;
  clients: Clients;
}

export async function createLock({ amount, days, account, clients }: CreateLockProps): Promise<boolean> {
  showLoadingToast("Creating lock...")

  return handleCallResult({
    successMessage: "Lock created successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: VOTING_ESCROW,
        abi: VotingEscrowAbi,
      },
      functionName: "create_lock",
      publicClient: clients.publicClient,
      args: [parseEther(Number(amount).toLocaleString("fullwide", { useGrouping: false })), BigInt(Math.floor(Date.now() / 1000) + (86400 * days))]
    }),
    clients
  })
}

interface IncreaseLockAmountProps {
  amount: number | string;
  account: Address;
  clients: Clients;
}

export async function increaseLockAmount({ amount, account, clients }: IncreaseLockAmountProps): Promise<boolean> {
  showLoadingToast("Increasing lock amount...")

  return handleCallResult({
    successMessage: "Lock amount increased successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: VOTING_ESCROW,
        abi: VotingEscrowAbi,
      },
      functionName: "increase_amount",
      publicClient: clients.publicClient,
      args: [parseEther(Number(amount).toLocaleString("fullwide", { useGrouping: false }))]
    }),
    clients
  })
}

interface IncreaseLockTimeProps {
  unlockTime: number;
  account: Address;
  clients: Clients;
}

export async function increaseLockTime({ unlockTime, account, clients }: IncreaseLockTimeProps): Promise<boolean> {
  showLoadingToast("Increasing lock time...")

  return handleCallResult({
    successMessage: "Lock amount increased successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: VOTING_ESCROW,
        abi: VotingEscrowAbi,
      },
      functionName: "increase_unlock_time",
      publicClient: clients.publicClient,
      args: [BigInt(unlockTime)]
    }),
    clients
  })
}

interface WithdrawLockProps {
  account: Address;
  clients: Clients;
}

export async function withdrawLock({ account, clients }: WithdrawLockProps): Promise<boolean> {
  showLoadingToast("Withdrawing lock...")

  return handleCallResult({
    successMessage: "Withdrawal successful!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: VOTING_ESCROW,
        abi: VotingEscrowAbi,
      },
      functionName: "withdraw",
      publicClient: clients.publicClient,
    }),
    clients
  })
}

interface GaugeInteractionProps {
  chainId: number;
  address: Address;
  amount: number;
  account: Address;
  clients: Clients;
}

export async function gaugeDeposit({ chainId, address, amount, account, clients }: GaugeInteractionProps): Promise<boolean> {
  showLoadingToast("Staking into Gauge...")

  return handleCallResult({
    successMessage: "Staked into Gauge successful!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address,
        abi: GaugeAbi,
      },
      functionName: "deposit",
      publicClient: clients.publicClient,
      args: [amount]
    }),
    clients
  })
}

export async function gaugeWithdraw({ chainId, address, amount, account, clients }: GaugeInteractionProps): Promise<boolean> {
  showLoadingToast("Unstaking from Gauge...")

  return handleCallResult({
    successMessage: "Unstaked from Gauge successful!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address,
        abi: GaugeAbi,
      },
      functionName: "withdraw",
      publicClient: clients.publicClient,
      args: [amount]
    }),
    clients
  })
}