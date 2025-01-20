import { showLoadingToast } from "@/lib/toasts";
import { Clients, SimulationResponse, Token, TokenByAddress, VaultData } from "@/lib/types";
import { AsyncRouterByChain, AsyncVaultRouterAbi, OracleVaultAbi, VaultAbi } from "@/lib/constants";
import { Address, erc20Abi, PublicClient } from "viem";
import { VaultRouterAbi } from "@/lib/constants/abi/VaultRouter";
import { formatBalance, handleCallResult, simulateCall } from "@/lib/utils/helpers";
import { networkMap } from "@/lib/utils/connectors";
import mutateTokenBalance from "./mutateTokenBalance";

interface VaultWriteProps {
  chainId: number;
  vaultData: VaultData;
  asset: Token;
  vault: Token;
  account: Address;
  amount: bigint;
  clients: Clients;
  tokensAtom: [{ [key: number]: TokenByAddress }, Function]
}

interface VaultRouterWriteProps extends VaultWriteProps {
  router: Address;
}

interface BaseSimulateProps {
  address: Address;
  account: Address;
  functionName: string;
  publicClient: PublicClient;
}

interface VaultSimulateProps extends BaseSimulateProps {
  args: any[];
}

interface VaultRouterSimulateProps extends BaseSimulateProps {
  amount: bigint;
  vault: Address;
  gauge: Address;
}

async function simulateVaultCall({
  address,
  account,
  args,
  functionName,
  publicClient,
}: VaultSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: VaultAbi,
      // @ts-ignore
      functionName,
      // @ts-ignore
      args,
    });
    return { request: request, success: true, error: null };
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage };
  }
}

async function simulateVaultRouterCall({
  address,
  account,
  amount,
  vault,
  gauge,
  functionName,
  publicClient,
}: VaultRouterSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: VaultRouterAbi,
      // @ts-ignore
      functionName,
      args: [
        vault,
        gauge,
        amount,
        account,
      ],
    });
    return { request: request, success: true, error: null };
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage };
  }
}

export async function vaultDeposit({
  chainId,
  vaultData,
  asset,
  vault,
  account,
  amount,
  clients,
  tokensAtom
}: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Depositing into the vault...");

  const success = await handleCallResult({
    successMessage: "Deposited into the vault!",
    simulationResponse: await simulateVaultCall({
      address: vaultData.address,
      account,
      args: [
        amount,
        account,
      ],
      functionName: "deposit",
      publicClient: clients.publicClient,
    }),
    clients
  });

  if (success) {
    mutateTokenBalance({
      tokensToUpdate: [vault.address, asset.address],
      account,
      tokensAtom,
      chainId
    })
  }
  return success;
}

export async function vaultRedeem({
  chainId,
  vaultData,
  asset,
  vault,
  account,
  amount,
  clients,
  tokensAtom
}: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Withdrawing from the vault...");

  const maxRedeem = await clients.publicClient.readContract({
    address: vaultData.address,
    abi: VaultAbi,
    functionName: "maxRedeem",
    args: [account],
  });

  if (
    maxRedeem < amount
  ) {
    amount = maxRedeem;
  }

  const success = await handleCallResult({
    successMessage: "Withdrawn from the vault!",
    simulationResponse: await simulateVaultCall({
      address: vaultData.address,
      account,
      args: [
        amount,
        account,
        account,
      ],
      functionName: "redeem",
      publicClient: clients.publicClient,
    }),
    clients
  });

  if (success) {
    mutateTokenBalance({
      tokensToUpdate: [vault.address, asset.address],
      account,
      tokensAtom,
      chainId
    })
  }
  return success;
}

export async function vaultDepositAndStake({
  chainId,
  router,
  vaultData,
  asset,
  vault,
  account,
  amount,
  clients,
  tokensAtom
}: VaultRouterWriteProps): Promise<boolean> {
  showLoadingToast("Depositing into the vault...");

  const success = await handleCallResult({
    successMessage: "Deposited into the vault and staked into Gauge!",
    simulationResponse: await simulateVaultRouterCall({
      address: router,
      account,
      amount,
      vault: vaultData.address,
      gauge: vaultData.gauge!,
      functionName: "depositAndStake",
      publicClient: clients.publicClient,
    }),
    clients
  });
  if (success) {
    mutateTokenBalance({
      tokensToUpdate: [vaultData.asset, vaultData.gauge!],
      account,
      tokensAtom,
      chainId
    })
  }
  return success;
}

export async function vaultUnstakeAndWithdraw({
  chainId,
  router,
  vaultData,
  asset,
  vault,
  account,
  amount,
  clients,
  tokensAtom
}: VaultRouterWriteProps): Promise<boolean> {
  showLoadingToast("Withdrawing from the vault...");

  const success = await handleCallResult({
    successMessage: "Unstaked from Gauge and withdrawn from Vault!",
    simulationResponse: await simulateVaultRouterCall({
      address: router,
      account,
      amount,
      vault: vaultData.address,
      gauge: vaultData.gauge!,
      functionName: "unstakeAndWithdraw",
      publicClient: clients.publicClient,
    }),
    clients
  });
  if (success) {
    mutateTokenBalance({
      tokensToUpdate: [vaultData.gauge!, vaultData.asset],
      account,
      tokensAtom,
      chainId
    })
  }
  return success;
}

export async function vaultAsyncWithdraw({
  chainId,
  vaultData,
  asset,
  vault,
  account,
  amount,
  clients,
  tokensAtom
}: VaultWriteProps): Promise<boolean> {
  const res = await clients.publicClient.multicall({
    contracts: [
      {
        address: vaultData.address,
        abi: OracleVaultAbi,
        functionName: "convertToAssets",
        args: [amount]
      },
      {
        address: vaultData.asset,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [vaultData.safes![0]]
      }
    ]
  })

  const expectedAssets = res[0].result as bigint;
  const float = res[1].result as bigint;

  let success = false;
  if (float >= expectedAssets) {
    success = await vaultRequestFulfillWithdraw({
      chainId,
      vaultData,
      asset,
      vault,
      account,
      amount,
      clients,
      tokensAtom
    })
  } else {
    success = await vaultRequestRedeem({
      chainId,
      vaultData,
      asset,
      vault,
      account,
      amount,
      clients,
      tokensAtom
    })
  }

  return success;
}

export async function vaultAsyncUnstakeWithdraw({
  chainId,
  vaultData,
  asset,
  vault,
  account,
  amount,
  clients,
  tokensAtom
}: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Unstaking and Redeeming...");

  const res = await clients.publicClient.multicall({
    contracts: [
      {
        address: vaultData.address,
        abi: OracleVaultAbi,
        functionName: "convertToAssets",
        args: [amount]
      },
      {
        address: vaultData.asset,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [vaultData.safes![0]]
      }
    ]
  });

  const expectedAssets = res[0].result as bigint;
  const float = res[1].result as bigint;

  let success = false;
  if (float >= expectedAssets) {
    success = await handleCallResult({
      successMessage: "Redeemed!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: AsyncRouterByChain[chainId],
          abi: AsyncVaultRouterAbi,
        },
        functionName: "unstakeRequestFulfillWithdraw",
        publicClient: clients.publicClient,
        args: [vaultData.gauge, vaultData.address, account, amount]
      }),
      clients,
    });
  } else {
    success = await vaultUnstakeRequestRedeem({
      chainId,
      vaultData,
      asset,
      vault,
      account,
      amount,
      clients,
      tokensAtom
    })
  }

  if (success) {
    mutateTokenBalance({
      tokensToUpdate: [vault.address, asset.address],
      account,
      tokensAtom,
      chainId
    })
  }
  return success;
}

export async function vaultRequestFulfillWithdraw({
  chainId,
  vaultData,
  asset,
  vault,
  account,
  amount,
  clients,
  tokensAtom
}: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Redeeming...");

  const success = await handleCallResult({
    successMessage: "Redeemed!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: AsyncRouterByChain[chainId],
        abi: AsyncVaultRouterAbi,
      },
      functionName: "requestFulfillWithdraw",
      publicClient: clients.publicClient,
      args: [vaultData.address, account, amount]
    }),
    clients,
  });

  if (success) {
    mutateTokenBalance({
      tokensToUpdate: [vault.address, asset.address],
      account,
      tokensAtom,
      chainId
    })
  }
  return success;
}

export async function vaultRequestRedeem({
  chainId,
  vaultData,
  asset,
  vault,
  account,
  amount,
  clients,
  tokensAtom
}: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Requesting redeem...");

  const success = await handleCallResult({
    successMessage: "Redeem requested!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: vaultData.address,
        abi: OracleVaultAbi,
      },
      functionName: "requestRedeem",
      publicClient: clients.publicClient,
      args: [amount, account, account]
    }),
    clients,
  });

  if (success) {
    mutateTokenBalance({
      tokensToUpdate: [vault.address],
      account,
      tokensAtom,
      chainId
    })
  }
  return success;
}

export async function vaultUnstakeRequestRedeem({
  chainId,
  vaultData,
  asset,
  vault,
  account,
  amount,
  clients,
  tokensAtom
}: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Unstaking and Requesting redeem...");

  const success = await handleCallResult({
    successMessage: "Redeem requested!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: AsyncRouterByChain[chainId],
        abi: AsyncVaultRouterAbi,
      },
      functionName: "unstakeAndRequestWithdrawal",
      publicClient: clients.publicClient,
      args: [vaultData.gauge!, vault.address, account, amount]
    }),
    clients,
  });

  if (success) {
    mutateTokenBalance({
      tokensToUpdate: [vault.address],
      account,
      tokensAtom,
      chainId
    })
  }
  return success;
}

export async function vaultCancelRedeem({
  chainId,
  vaultData,
  asset,
  vault,
  account,
  amount,
  clients,
  tokensAtom
}: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Canceling redeem request...");

  const success = await handleCallResult({
    successMessage: "Redeem request canceled!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: vault.address,
        abi: OracleVaultAbi,
      },
      functionName: "cancelRedeemRequest",
      publicClient: clients.publicClient,
      args: [account]
    }),
    clients,
  });

  if (success) {
    mutateTokenBalance({
      tokensToUpdate: [vault.address],
      account,
      tokensAtom,
      chainId
    })
  }

  return success;
}
