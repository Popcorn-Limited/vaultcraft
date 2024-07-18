import {
  Address,
  parseEther,
  zeroAddress,
} from "viem";
import { Clients, TokenByAddress, VaultData } from "@/lib/types";
import { showLoadingToast } from "@/lib/toasts";
import { GAUGE_CONTROLLER, GaugeAbi, GaugeControllerAbi, RewardsClaimerAbi, RewardsClaimerByChain, VOTING_ESCROW, VotingEscrowAbi } from "@/lib/constants";
import { handleCallResult, simulateCall } from "@/lib/utils/helpers";
import { networkMap } from "@/lib/utils/connectors";
import { VeBeaconAbi } from "@/lib/constants/abi/VeBeacon";
import { RootGaugeFactoryAbi } from "@/lib/constants/abi/RootGaugeFactory";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { sendMessageToDiscord } from "@/lib/discord/discordBot";

interface SendVotesProps {
  vaults: VaultData[];
  votes: { [key: Address]: number };
  prevVotes: { [key: Address]: number };
  account: Address;
  clients: Clients;
}

export async function sendVotes({
  vaults,
  votes,
  prevVotes,
  account,
  clients,
}: SendVotesProps): Promise<boolean> {
  showLoadingToast("Sending votes...");

  console.log({ votes })

  const votesCleaned = Object.entries(votes).filter(
    (vote, index) =>
      Math.abs(vote[1] - Number(prevVotes[vote[0] as Address])) > 0
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
  amount = Number(amount) * 1e18

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
      args: [BigInt(amount.toLocaleString("fullwide", { useGrouping: false }))],
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
  vaultData: VaultData,
  amount: number;
  account: Address;
  clients: Clients;
  tokensAtom: [{ [key: number]: TokenByAddress }, Function]
}

export async function gaugeDeposit({
  vaultData,
  amount,
  account,
  clients,
  tokensAtom
}: GaugeInteractionProps): Promise<boolean> {
  showLoadingToast("Staking into Gauge...");

  const success = await handleCallResult({
    successMessage: "Staked into Gauge successful!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: vaultData.gauge!,
        abi: GaugeAbi,
      },
      functionName: "deposit",
      publicClient: clients.publicClient,
      args: [amount],
    }),
    clients,
  });

  if (success) {
    mutateTokenBalance({
      tokensToUpdate: [vaultData.address, vaultData.gauge!],
      account,
      tokensAtom,
      chainId: vaultData.chainId
    })
  }

  return success
}

export async function gaugeWithdraw({
  vaultData,
  amount,
  account,
  clients,
  tokensAtom
}: GaugeInteractionProps): Promise<boolean> {
  showLoadingToast("Unstaking from Gauge...");

  const success = await handleCallResult({
    successMessage: "Unstaked from Gauge successful!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: vaultData.gauge!,
        abi: GaugeAbi,
      },
      functionName: "withdraw",
      publicClient: clients.publicClient,
      args: [amount],
    }),
    clients,
  });

  if (success) {
    mutateTokenBalance({
      tokensToUpdate: [vaultData.address, vaultData.gauge!],
      account,
      tokensAtom,
      chainId: vaultData.chainId
    })
  }
  return success
}

export async function broadcastVeBalance({ targetChain, account, address, clients, }
  : { targetChain: number, account: Address, address: Address, clients: Clients }) {
  const { walletClient, publicClient } = clients;

  if (walletClient.chain?.id !== Number(1)) {
    try {
      await walletClient.switchChain({ id: 1 });
    } catch (error: any) {
      await sendMessageToDiscord({
        chainId: publicClient.chain?.id ?? 0,
        target: address,
        user: account,
        isSimulation: false,
        method: "Switching chains",
        reason: error ?? "",
      });
      return
    }
  }

  showLoadingToast(`Broadcasting VeBalance to ${networkMap[targetChain]}...`)

  let simRes;
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: VeBeaconAbi,
      functionName: "broadcastVeBalance",
      args: [account, BigInt(String(targetChain)), BigInt("500000"), BigInt("100000000")],
      value: parseEther("0.01")
    })
    simRes = { request: request, success: true, error: null }
  } catch (error: any) {
    simRes = { request: null, success: false, error: error.shortMessage }
  }

  return handleCallResult({
    successMessage: "VeBalance broadcasted!",
    simulationResponse: simRes,
    clients
  })
}

export async function transmitRewards({ gauges, account, address, clients }
  : { gauges: Address[], account: Address, address: Address, clients: Clients }) {
  const { walletClient, publicClient } = clients;


  if (walletClient.chain?.id !== Number(1)) {
    try {
      await walletClient.switchChain({ id: 1 });
    } catch (error: any) {
      await sendMessageToDiscord({
        chainId: publicClient.chain?.id ?? 0,
        target: address,
        user: account,
        isSimulation: false,
        method: "switch chain",
        reason: error ?? "",
      });
      return
    }
  }

  showLoadingToast("Bridging Rewards...")

  let simRes;
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: RootGaugeFactoryAbi,
      functionName: "transmit_emissions_multiple",
      args: [gauges],
      value: parseEther("0.05")
    })
    simRes = { request: request, success: true, error: null }
  } catch (error: any) {
    simRes = { request: null, success: false, error: error.shortMessage }
  }

  return handleCallResult({
    successMessage: "Bridged Rewards!",
    simulationResponse: simRes,
    clients
  });
}


interface FundRewardProps {
  gauge: Address;
  rewardToken: Address;
  amount: number;
  account: Address;
  clients: Clients;
  tokensAtom: [{ [key: number]: TokenByAddress }, Function]
}

export async function fundReward({
  gauge,
  rewardToken,
  amount,
  account,
  clients,
  tokensAtom
}: FundRewardProps): Promise<boolean> {
  showLoadingToast("Fund Gauge Reward...");

  const success = await handleCallResult({
    successMessage: "Funded Gauge Reward successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: gauge,
        abi: GaugeAbi,
      },
      functionName: "deposit_reward_token",
      publicClient: clients.publicClient,
      args: [rewardToken, amount],
    }),
    clients
  });

  if (success) {
    mutateTokenBalance({
      tokensToUpdate: [rewardToken],
      account,
      tokensAtom,
      chainId: clients.publicClient?.chain?.id || 1
    })
  }
  return success
}

export async function claimRewards({
  gauge,
  account,
  clients,
  chainId
}: { gauge: Address, account: Address, clients: Clients, chainId: number }): Promise<boolean> {
  showLoadingToast("Claim Gauge Reward...");

  /// Deal with the misconfgured ARB USDC Compound Gauge
  if (gauge === "0xc9aD14cefb29506534a973F7E0E97e68eCe4fa3f") {
    return handleCallResult({
      successMessage: "Claim Gauge Reward successfully!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: "0x6ee09de47c67a858ae84ab0848a50ca2278bc959",
          abi: ClaimerAbi,
        },
        functionName: "claim",
        publicClient: clients.publicClient,
      }),
      clients,
    });
  }

  return handleCallResult({
    successMessage: "Claim Gauge Reward successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: RewardsClaimerByChain[chainId],
        abi: RewardsClaimerAbi,
      },
      functionName: "claimAndUnwrap",
      args: [gauge],
      publicClient: clients.publicClient,
    }),
    clients
  });
}

const ClaimerAbi = [{ "inputs": [{ "internalType": "address", "name": "gauge_", "type": "address" }, { "internalType": "address", "name": "rewardToken_", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "gauge", "outputs": [{ "internalType": "contract ILiquidityGauge", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "rewardToken", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }] as const