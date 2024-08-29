import { LockVaultAbi } from "@/lib/constants";
import { showLoadingToast } from "@/lib/toasts";
import { Clients, TokenByAddress } from "@/lib/types";
import { handleCallResult, simulateCall } from "@/lib/utils/helpers";
import { Address } from "viem";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";

interface SharedProps {
  address: Address;
  account: Address;
  chainId: number;
  tokensToUpdate: Address[];
  tokensAtom: [{ [key: number]: TokenByAddress }, Function];
  clients: Clients
}

export async function deposit({
  amount,
  time,
  address,
  account,
  chainId,
  tokensToUpdate,
  tokensAtom,
  clients,
}: SharedProps & { amount: number, time: number }): Promise<boolean> {
  showLoadingToast("Staking...");

  const success = await handleCallResult({
    successMessage: "Staked successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address,
        abi: LockVaultAbi,
      },
      functionName: "deposit",
      publicClient: clients.publicClient,
      args: [
        account,
        BigInt(amount.toLocaleString("fullwide", { useGrouping: false })),
        BigInt(time)
      ],
    }),
    clients,
  });
  if (success) {
    mutateTokenBalance({
      tokensToUpdate,
      account,
      tokensAtom,
      chainId
    })
  }
  return success
}

export async function increaseDeposit({
  amount,
  address,
  account,
  chainId,
  tokensToUpdate,
  tokensAtom,
  clients,
}: SharedProps & { amount: number }): Promise<boolean> {
  showLoadingToast("Increasing stake amount...");

  const success = await handleCallResult({
    successMessage: "Increased stake amount successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address,
        abi: LockVaultAbi,
      },
      functionName: "increaseLockAmount",
      publicClient: clients.publicClient,
      args: [
        account,
        BigInt(amount.toLocaleString("fullwide", { useGrouping: false })),
      ],
    }),
    clients,
  });
  if (success) {
    mutateTokenBalance({
      tokensToUpdate,
      account,
      tokensAtom,
      chainId
    })
  }
  return success
}

export async function withdraw({
  address,
  account,
  chainId,
  tokensToUpdate,
  tokensAtom,
  clients,
}: SharedProps): Promise<boolean> {
  showLoadingToast("Withdraw...");

  const success = await handleCallResult({
    successMessage: "Fully withdrawn!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address,
        abi: LockVaultAbi,
      },
      functionName: "withdraw",
      publicClient: clients.publicClient,
      args: [account, account],
    }),
    clients,
  });
  if (success) {
    mutateTokenBalance({
      tokensToUpdate,
      account,
      tokensAtom,
      chainId
    })
  }
  return success
}

export async function claim({
  address,
  account,
  chainId,
  tokensToUpdate,
  tokensAtom,
  clients,
}: SharedProps): Promise<boolean> {
  showLoadingToast("Claiming rewards...");

  const success = await handleCallResult({
    successMessage: "Claimed rewards!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address,
        abi: LockVaultAbi,
      },
      functionName: "claim",
      publicClient: clients.publicClient,
      args: [account],
    }),
    clients,
  });
  if (success) {
    mutateTokenBalance({
      tokensToUpdate,
      account,
      tokensAtom,
      chainId
    })
  }
  return success
}

export async function fundReward({
  amounts,
  address,
  account,
  chainId,
  tokensToUpdate,
  tokensAtom,
  clients,
}: SharedProps & { amounts: number[] }): Promise<boolean> {
  showLoadingToast("Funding rewards...");

  const success = await handleCallResult({
    successMessage: "Funded rewards successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address,
        abi: LockVaultAbi,
      },
      functionName: "distributeRewards",
      publicClient: clients.publicClient,
      args: [amounts.map(amount => BigInt(amount.toLocaleString("fullwide", { useGrouping: false })))],
    }),
    clients,
  });

  if (success) {
    mutateTokenBalance({
      tokensToUpdate,
      account,
      tokensAtom,
      chainId
    })
  }
  return success
}