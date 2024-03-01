import { handleAllowance } from "@/lib/approve";
import {
  Clients,
  LockVaultActionType,
  LockVaultData,
  Token,
} from "@/lib/types";
import { Address, getAddress } from "viem";
import { FireEventArgs } from "@masa-finance/analytics-sdk";
import axios from "axios";
import { erc20ABI } from "wagmi";
import {
  handleClaim,
  handleDeposit,
  handleIncreaseAmount,
  handleWithdraw,
} from "@/lib/vault/lockVault/interactions";
import zap from "@/lib/vault/zap";

interface HandleVaultInteractionProps {
  amount: number;
  days: number;
  action: LockVaultActionType;
  stepCounter: number;
  vaultData: LockVaultData;
  account: Address;
  clients: Clients;
  fireEvent?: (
    type: string,
    {
      user_address,
      network,
      contract_address,
      asset_amount,
      asset_ticker,
      additionalEventData,
    }: FireEventArgs
  ) => Promise<void>;
  referral?: Address;
  chainId: number;
  inputToken: Token;
  outputToken: Token;
  slippage: number;
  tradeTimeout: number;
}

export default async function handleVaultInteraction({
  amount,
  days,
  action,
  stepCounter,
  vaultData,
  account,
  clients,
  fireEvent,
  referral,
  chainId,
  inputToken,
  outputToken,
  slippage,
  tradeTimeout,
}: HandleVaultInteractionProps): Promise<() => Promise<boolean>> {
  let postBal = 0;
  switch (action) {
    case LockVaultActionType.Deposit:
      switch (stepCounter) {
        case 0:
          return () =>
            handleAllowance({
              token: vaultData.asset.address,
              amount,
              account,
              spender: vaultData.vault.address,
              clients,
            });
        case 1:
          return () =>
            handleDeposit({
              vaultData,
              account,
              amount,
              days: Number(days),
              clients,
              fireEvent,
              referral,
            });
      }
    case LockVaultActionType.IncreaseAmount:
      switch (stepCounter) {
        case 0:
          return () =>
            handleAllowance({
              token: vaultData.asset.address,
              amount,
              account,
              spender: vaultData.vault.address,
              clients,
            });
        case 1:
          return () =>
            handleIncreaseAmount({
              vaultData,
              account,
              amount,
              clients,
            });
      }
    case LockVaultActionType.Withdrawal:
      return () =>
        handleWithdraw({
          vaultData,
          account,
          amount,
          clients,
          fireEvent,
          referral,
        });
    case LockVaultActionType.Claim:
      return () =>
        handleClaim({
          vaultData,
          account,
          clients,
        });
    case LockVaultActionType.ZapDeposit:
      switch (stepCounter) {
        case 0:
          const ensoWallet = (
            await axios.get(
              `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${account}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.ENSO_API_KEY}`,
                },
              }
            )
          ).data;
          return () =>
            handleAllowance({
              token: inputToken.address,
              amount,
              account,
              spender: getAddress(ensoWallet.address),
              clients,
            });
        case 1:
          return () =>
            zap({
              chainId,
              sellToken: inputToken.address,
              buyToken: vaultData.asset.address,
              amount,
              account,
              slippage,
              tradeTimeout,
              clients,
            });
        case 2:
          postBal = Number(
            await clients.publicClient.readContract({
              address: vaultData.asset.address,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [account],
            })
          );
          return () =>
            handleAllowance({
              token: vaultData.asset.address,
              amount: postBal - vaultData.asset.balance,
              account,
              spender: vaultData.vault.address,
              clients,
            });
        case 3:
          postBal = Number(
            await clients.publicClient.readContract({
              address: vaultData.asset.address,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [account],
            })
          );
          return () =>
            handleDeposit({
              vaultData,
              account,
              amount: postBal - vaultData.asset.balance,
              days,
              clients,
              fireEvent,
              referral,
            });
      }
    case LockVaultActionType.ZapIncreaseAmount:
      switch (stepCounter) {
        case 0:
          const ensoWallet = (
            await axios.get(
              `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${account}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.ENSO_API_KEY}`,
                },
              }
            )
          ).data;
          return () =>
            handleAllowance({
              token: inputToken.address,
              amount,
              account,
              spender: getAddress(ensoWallet.address),
              clients,
            });
        case 1:
          return () =>
            zap({
              chainId,
              sellToken: inputToken.address,
              buyToken: vaultData.asset.address,
              amount,
              account,
              slippage,
              tradeTimeout,
              clients,
            });
        case 2:
          postBal = Number(
            await clients.publicClient.readContract({
              address: vaultData.asset.address,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [account],
            })
          );
          return () =>
            handleAllowance({
              token: vaultData.asset.address,
              amount: postBal - vaultData.asset.balance,
              account,
              spender: vaultData.vault.address,
              clients,
            });
        case 3:
          postBal = Number(
            await clients.publicClient.readContract({
              address: vaultData.asset.address,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [account],
            })
          );
          return () =>
            handleIncreaseAmount({
              vaultData,
              account,
              amount: postBal - vaultData.asset.balance,
              clients,
            });
      }
    case LockVaultActionType.ZapWithdrawal:
      switch (stepCounter) {
        case 0:
          return () => handleWithdraw({ vaultData, account, amount, clients });
        case 1:
          const ensoWallet = (
            await axios.get(
              `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${account}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.ENSO_API_KEY}`,
                },
              }
            )
          ).data;
          return () =>
            handleAllowance({
              token: vaultData.asset.address,
              amount,
              account,
              spender: getAddress(ensoWallet.address),
              clients,
            });
        case 2:
          postBal = Number(
            await clients.publicClient.readContract({
              address: vaultData.asset.address,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [account],
            })
          );
          return () =>
            zap({
              chainId,
              sellToken: vaultData.asset.address,
              buyToken: outputToken.address,
              amount: postBal - vaultData.asset.balance,
              account,
              slippage,
              tradeTimeout,
              clients,
            });
      }
    default:
      // We should never reach this code. This is here just to make ts happy
      return async () => false;
  }
}
