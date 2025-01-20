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

interface GaugeInteractionProps {
  vaultData: VaultData,
  amount: bigint;
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