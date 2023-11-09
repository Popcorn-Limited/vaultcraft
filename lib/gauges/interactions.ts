import { Abi, Address, PublicClient, WalletClient, parseEther, zeroAddress } from "viem";
import { VaultData } from "@/lib/types";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts";
import { SimulationResponse } from "@/lib/types";
import { getVeAddresses } from "@/lib/utils/addresses";
import { GaugeAbi, GaugeControllerAbi, VotingEscrowAbi } from "@/lib/constants";

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

export async function sendVotes({ vaults, votes, account, clients }: SendVotesProps) {
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

    const { request, success, error: simulationError } = await simulateCall({
      account,
      contract: {
        address: GAUGE_CONTROLLER,
        abi: GaugeControllerAbi,
      },
      functionName: "vote_for_many_gauge_weights",
      publicClient: clients.publicClient,
      args: [addr, v]
    })

    if (success) {
      try {
        const hash = await clients.walletClient.writeContract(request)
        const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
        showSuccessToast("Voted for gauges!")
      } catch (error: any) {
        showErrorToast(error.shortMessage)
      }
    } else {
      showErrorToast(simulationError)
    }
  }
}

interface CreateLockProps {
  amount: number | string;
  days: number;
  account: Address;
  clients: Clients;
}

export async function createLock({ amount, days, account, clients }: CreateLockProps) {
  showLoadingToast("Creating lock...")

  const { request, success, error: simulationError } = await simulateCall({
    account,
    contract: {
      address: VOTING_ESCROW,
      abi: VotingEscrowAbi,
    },
    functionName: "create_lock",
    publicClient: clients.publicClient,
    args: [parseEther(Number(amount).toLocaleString("fullwide", { useGrouping: false })), BigInt(Math.floor(Date.now() / 1000) + (86400 * days))]
  })

  if (success) {
    try {
      const hash = await clients.walletClient.writeContract(request)
      const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Lock created successfully!")
    } catch (error: any) {
      showErrorToast(error.shortMessage)
    }
  } else {
    showErrorToast(simulationError)
  }
}

interface IncreaseLockAmountProps {
  amount: number | string;
  account: Address;
  clients: Clients;
}

export async function increaseLockAmount({ amount, account, clients }: IncreaseLockAmountProps) {
  showLoadingToast("Increasing lock amount...")

  const { request, success, error: simulationError } = await simulateCall({
    account,
    contract: {
      address: VOTING_ESCROW,
      abi: VotingEscrowAbi,
    },
    functionName: "increase_amount",
    publicClient: clients.publicClient,
    args: [parseEther(Number(amount).toLocaleString("fullwide", { useGrouping: false }))]
  })

  if (success) {
    try {
      const hash = await clients.walletClient.writeContract(request)
      const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Lock amount increased successfully!")
    } catch (error: any) {
      showErrorToast(error.shortMessage)
    }
  } else {
    showErrorToast(simulationError)
  }
}

interface IncreaseLockTimeProps {
  unlockTime: number;
  account: Address;
  clients: Clients;
}

export async function increaseLockTime({ unlockTime, account, clients }: IncreaseLockTimeProps) {
  showLoadingToast("Increasing lock time...")

  const { request, success, error: simulationError } = await simulateCall({
    account,
    contract: {
      address: VOTING_ESCROW,
      abi: VotingEscrowAbi,
    },
    functionName: "increase_unlock_time",
    publicClient: clients.publicClient,
    args: [BigInt(unlockTime)]
  })

  if (success) {
    try {
      const hash = await clients.walletClient.writeContract(request)
      const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Lock time increased successfully!")
    } catch (error: any) {
      showErrorToast(error.shortMessage)
    }
  } else {
    showErrorToast(simulationError)
  }
}

interface WithdrawLockProps {
  account: Address;
  clients: Clients;
}

export async function withdrawLock({ account, clients }: WithdrawLockProps) {
  showLoadingToast("Withdrawing lock...")

  const { request, success, error: simulationError } = await simulateCall({
    account,
    contract: {
      address: VOTING_ESCROW,
      abi: VotingEscrowAbi,
    },
    functionName: "withdraw",
    publicClient: clients.publicClient,
  })

  if (success) {
    try {
      const hash = await clients.walletClient.writeContract(request)
      const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Withdrawal successful!")
    } catch (error: any) {
      showErrorToast(error.shortMessage)
    }
  } else {
    showErrorToast(simulationError)
  }
}

interface GaugeInteractionProps {
  address: Address;
  amount: number;
  account: Address;
  clients: Clients;
}

export async function gaugeDeposit({ address, amount, account, clients }: GaugeInteractionProps): Promise<boolean> {
  showLoadingToast("Staking into Gauge...")

  const { request, success, error: simulationError } = await simulateCall({
    account,
    contract: {
      address,
      abi: GaugeAbi,
    },
    functionName: "deposit",
    publicClient: clients.publicClient,
    args: [amount]
  })

  if (success) {
    try {
      const hash = await clients.walletClient.writeContract(request)
      const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Staked into Gauge successful!")
      return true
    } catch (error: any) {
      showErrorToast(error.shortMessage)
      return false;
    }
  } else {
    showErrorToast(simulationError)
    return false;
  }
}

export async function gaugeWithdraw({ address, amount, account, clients }: GaugeInteractionProps): Promise<boolean> {
  showLoadingToast("Unstaking from Gauge...")

  const { request, success, error: simulationError } = await simulateCall({
    account,
    contract: {
      address,
      abi: GaugeAbi,
    },
    functionName: "withdraw",
    publicClient: clients.publicClient,
    args: [amount]
  })

  if (success) {
    try {
      const hash = await clients.walletClient.writeContract(request)
      const receipt = await clients.publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Unstaked from Gauge successful!")
      return true
    } catch (error: any) {
      showErrorToast(error.shortMessage)
      return false;
    }
  } else {
    showErrorToast(simulationError)
    return false;
  }
}