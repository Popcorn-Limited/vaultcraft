import {
  Abi,
  Address,
  PublicClient,
  getAddress,
  parseEther,
  zeroAddress,
} from "viem";
import { Clients, VaultData } from "@/lib/types";
import { showLoadingToast } from "@/lib/toasts";
import { SimulationResponse } from "@/lib/types";
import { getVeAddresses } from "@/lib/constants";
import { GaugeAbi, GaugeControllerAbi, VotingEscrowAbi } from "@/lib/constants";
import { handleCallResult } from "@/lib/utils/helpers";
import { voteUserSlopes } from "@/lib/gauges/useGaugeWeights";

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

const { GaugeController: GAUGE_CONTROLLER, VotingEscrow: VOTING_ESCROW } =
  getVeAddresses();

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

interface SendVotesProps {
  vaults: VaultData[];
  votes: { [key: Address]: number };
  prevVotes: { [key: Address]: number };
  canVoteOnGauges: boolean[];
  account: Address;
  clients: Clients;
}

export async function sendVotes({
  vaults,
  votes,
  prevVotes,
  canVoteOnGauges,
  account,
  clients,
}: SendVotesProps): Promise<boolean> {
  showLoadingToast("Sending votes...");

  console.log({ votes })

  const votesCleaned = Object.entries(votes).filter(
    (vote, index) =>
      Math.abs(vote[1] - Number(prevVotes[vote[0] as Address])) > 0 &&
      canVoteOnGauges[index]
  )
    .map((vote, index) => [...vote, vote[1] - Number(prevVotes[vote[0] as Address])])
    // @ts-ignore
    .sort((a, b) => a[2] - b[2])

  console.log({ votesCleaned })

  let addr = new Array<string>(8);
  let v = new Array<number>(8);

  for (let i = 0; i < Math.ceil(votesCleaned.length / 8); i++) {
    addr = [];
    v = [];

    for (let n = 0; n < 8; n++) {
      const l = i * 8;
      if (votesCleaned[n + l] === undefined) {
        addr[n] = zeroAddress;
        v[n] = 0;
      } else {
        addr[n] = votesCleaned[n + l][0] as string;
        v[n] = votesCleaned[n + l][1] as number;
      }
    }

    console.log({ addr, v })

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
        args: [addr, v],
      }),
      clients,
    });
    if (!success) return false;
  }
  return true;
}

interface CreateLockProps {
  amount: number;
  days: number;
  account: Address;
  clients: Clients;
}

export async function createLock({
  amount,
  days,
  account,
  clients,
}: CreateLockProps): Promise<boolean> {
  showLoadingToast("Creating lock...");

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
      args: [
        BigInt(amount.toLocaleString("fullwide", { useGrouping: false })),
        BigInt(Math.floor(Date.now() / 1000) + 86400 * days),
      ],
    }),
    clients,
  });
}

interface IncreaseLockAmountProps {
  amount: number | string;
  account: Address;
  clients: Clients;
}

export async function increaseLockAmount({
  amount,
  account,
  clients,
}: IncreaseLockAmountProps): Promise<boolean> {
  showLoadingToast("Increasing lock amount...");

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
      args: [
        parseEther(
          Number(amount).toLocaleString("fullwide", { useGrouping: false })
        ),
      ],
    }),
    clients,
  });
}

interface IncreaseLockTimeProps {
  unlockTime: number;
  account: Address;
  clients: Clients;
}

export async function increaseLockTime({
  unlockTime,
  account,
  clients,
}: IncreaseLockTimeProps): Promise<boolean> {
  showLoadingToast("Increasing lock time...");

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
      args: [BigInt(unlockTime)],
    }),
    clients,
  });
}

interface WithdrawLockProps {
  account: Address;
  clients: Clients;
}

export async function withdrawLock({
  account,
  clients,
}: WithdrawLockProps): Promise<boolean> {
  showLoadingToast("Withdrawing lock...");

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
    clients,
  });
}

interface GaugeInteractionProps {
  chainId: number;
  address: Address;
  amount: number;
  account: Address;
  clients: Clients;
}

export async function gaugeDeposit({
  chainId,
  address,
  amount,
  account,
  clients,
}: GaugeInteractionProps): Promise<boolean> {
  showLoadingToast("Staking into Gauge...");

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
      args: [amount],
    }),
    clients,
  });
}

export async function gaugeWithdraw({
  chainId,
  address,
  amount,
  account,
  clients,
}: GaugeInteractionProps): Promise<boolean> {
  showLoadingToast("Unstaking from Gauge...");

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
      args: [amount],
    }),
    clients,
  });
}
