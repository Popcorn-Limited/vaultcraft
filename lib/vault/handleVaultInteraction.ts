import { Address } from "viem";
import { handleAllowance } from "@/lib/approve";
import { SmartVaultActionType, Clients, Token, VaultData, ZapProvider, TokenByAddress } from "@/lib/types";
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultUnstakeAndWithdraw } from "@/lib/vault/interactions";
import zap, { handleZapAllowance } from "@/lib/vault/zap";
import { gaugeDeposit, gaugeWithdraw } from "@/lib/gauges/interactions";
import { erc20ABI } from "wagmi";
import { FireEventArgs } from "@masa-finance/analytics-sdk";
import { VaultRouterByChain } from "@/lib/constants";

interface HandleVaultInteractionProps {
  stepCounter: number;
  action: SmartVaultActionType;
  chainId: number;
  amount: number;
  inputToken: Token;
  outputToken: Token;
  vaultData: VaultData;
  asset: Token;
  vault: Token;
  gauge?: Token;
  account: Address;
  zapProvider: ZapProvider;
  slippage: number;
  tradeTimeout: number;
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
  tokensAtom: [{ [key: number]: TokenByAddress }, Function]
}

export default async function handleVaultInteraction({
  action,
  stepCounter,
  chainId,
  amount,
  inputToken,
  outputToken,
  vaultData,
  asset,
  vault,
  gauge,
  account,
  zapProvider,
  slippage,
  tradeTimeout,
  clients,
  fireEvent,
  referral,
  tokensAtom
}: HandleVaultInteractionProps): Promise<() => Promise<boolean>> {
  let postBal = 0;
  switch (action) {
    case SmartVaultActionType.Deposit:
      switch (stepCounter) {
        case 0:
          return () =>
            handleAllowance({
              token: inputToken.address,
              amount,
              account,
              spender: outputToken.address,
              clients,
            });
        case 1:
          return () =>
            vaultDeposit({
              chainId,
              vaultData,
              asset,
              vault,
              account,
              amount,
              clients,
              fireEvent,
              referral,
              tokensAtom
            });
      }
    case SmartVaultActionType.Withdrawal:
      return () =>
        vaultRedeem({
          chainId,
          vaultData,
          asset,
          vault,
          account,
          amount,
          clients,
          fireEvent,
          referral,
          tokensAtom
        });
    case SmartVaultActionType.Stake:
      switch (stepCounter) {
        case 0:
          return () =>
            handleAllowance({
              token: inputToken.address,
              amount,
              account,
              spender: vaultData.gauge!,
              clients,
            });
        case 1:
          return () =>
            gaugeDeposit({
              vaultData,
              account,
              amount,
              clients,
              tokensAtom
            });
      }
    case SmartVaultActionType.Unstake:
      return () =>
        gaugeWithdraw({
          vaultData,
          account,
          amount,
          clients,
          tokensAtom
        });
    case SmartVaultActionType.DepositAndStake:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({
            token: inputToken.address,
            amount,
            account,
            spender: VaultRouterByChain[chainId],
            clients
          })
        case 1:
          return () => vaultDepositAndStake({
            chainId,
            router: VaultRouterByChain[chainId],
            vaultData,
            asset,
            vault,
            account,
            amount,
            clients,
            fireEvent,
            referral,
            tokensAtom
          })
      }
    case SmartVaultActionType.UnstakeAndWithdraw:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({
            token: inputToken.address,
            amount,
            account,
            spender: VaultRouterByChain[chainId],
            clients
          })
        case 1:
          return () => vaultUnstakeAndWithdraw({
            chainId,
            router: VaultRouterByChain[chainId],
            vaultData,
            asset,
            vault,
            account,
            amount,
            clients,
            fireEvent,
            referral,
            tokensAtom
          })
      }
    case SmartVaultActionType.ZapDeposit:
      switch (stepCounter) {
        case 0:
          return () => handleZapAllowance({
            token: inputToken.address,
            amount,
            account,
            zapProvider,
            clients
          })
        case 1:
          return () => zap({
            chainId,
            sellToken: inputToken,
            buyToken: asset,
            amount,
            account,
            zapProvider,
            slippage,
            tradeTimeout,
            clients,
            tokensAtom
          })
        case 2:
          postBal = Number(
            await clients.publicClient.readContract({
              address: vaultData.asset,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [account],
            })
          );
          return () =>
            handleAllowance({
              token: vaultData.asset,
              amount: postBal - asset.balance,
              account,
              spender: vaultData.address,
              clients,
            });
        case 3:
          postBal = Number(
            await clients.publicClient.readContract({
              address: vaultData.asset,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [account],
            })
          );
          return () =>
            vaultDeposit({
              chainId,
              vaultData,
              asset,
              vault,
              account,
              amount: postBal - asset.balance,
              clients,
              fireEvent,
              referral,
              tokensAtom
            });
      }
    case SmartVaultActionType.ZapWithdrawal:
      switch (stepCounter) {
        case 0:
          return () =>
            vaultRedeem({
              chainId,
              vaultData,
              asset,
              vault,
              account,
              amount,
              clients,
              fireEvent,
              referral,
              tokensAtom
            });
        case 1:
          return () => handleZapAllowance({
            token: inputToken.address,
            amount,
            account,
            zapProvider,
            clients
          })
        case 2:
          postBal = Number(
            await clients.publicClient.readContract({
              address: vaultData.asset,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [account]
            })
          )
          return () => zap({
            chainId,
            sellToken: asset,
            buyToken: outputToken,
            amount: postBal - asset.balance,
            account,
            zapProvider,
            slippage,
            tradeTimeout,
            clients,
            tokensAtom
          })
      }
    case SmartVaultActionType.ZapDepositAndStake:
      switch (stepCounter) {
        case 0:
          return () => handleZapAllowance({
            token: inputToken.address,
            amount,
            account,
            zapProvider,
            clients
          })
        case 1:
          return () => zap({
            chainId,
            sellToken: inputToken,
            buyToken: asset,
            amount,
            account,
            zapProvider,
            slippage,
            tradeTimeout,
            clients,
            tokensAtom
          })
        case 2:
          postBal = Number(
            await clients.publicClient.readContract({
              address: vaultData.asset,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [account]
            }))
          return () => handleAllowance({
            token: vaultData.asset,
            amount: postBal - asset.balance,
            account,
            spender: VaultRouterByChain[chainId],
            clients
          })
        case 3:
          postBal = Number(
            await clients.publicClient.readContract({
              address: vaultData.asset,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [account]
            }))
          return () => vaultDepositAndStake({
            chainId,
            router: VaultRouterByChain[chainId],
            vaultData,
            asset,
            vault,
            account,
            amount: postBal - asset.balance,
            clients,
            fireEvent,
            referral,
            tokensAtom
          })
      }
    case SmartVaultActionType.ZapUnstakeAndWithdraw:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({
            token: inputToken.address,
            amount,
            account,
            spender: VaultRouterByChain[chainId],
            clients
          })
        case 1:
          return () => vaultUnstakeAndWithdraw({
            chainId,
            router: VaultRouterByChain[chainId],
            vaultData,
            asset,
            vault,
            account,
            amount,
            clients,
            fireEvent,
            referral,
            tokensAtom
          })
        case 2:
          return () => handleZapAllowance({
            token: inputToken.address,
            amount,
            account,
            zapProvider,
            clients
          })
        case 3:
          return () => zap({
            chainId,
            sellToken: asset,
            buyToken: outputToken,
            amount,
            account,
            zapProvider,
            slippage,
            tradeTimeout,
            clients,
            tokensAtom
          })
      }
    default:
      // We should never reach this code. This is here just to make ts happy
      return async () => false;
  }
}
