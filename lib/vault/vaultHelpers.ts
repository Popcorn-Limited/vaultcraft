import { Address, PublicClient, erc20Abi } from "viem"
import { Clients, VaultActionType, TokenType, VaultData, ZapProvider, Token, TokenByAddress, VaultAction as Action } from "@/lib/types"
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors"
import { formatBalanceUSD, NumberFormatter } from "@/lib/utils/helpers"
import { Networth, TVL } from "@/lib/atoms"
import { AsyncRouterByChain, VaultAbi, VaultRouterByChain } from "@/lib/constants"
import zap from "@/lib/zap"
import { gaugeDeposit, gaugeWithdraw } from "@/lib/gauges/interactions"
import { handleAllowance } from "@/lib/approve"
import { handleZapAllowance } from "@/lib/zap/zapAllowance"
import { vaultCancelRedeem, vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultRequestFulfillWithdraw, vaultRequestRedeem, vaultUnstakeAndWithdraw } from "./interactions"

export function getDescription(inputToken: Token, outputToken: Token, amount: number, action: Action, vaultData: VaultData) {
  const val = NumberFormatter.format(amount)
  switch (action) {
    case Action.depositApprove:
      return `Approving ${val} ${inputToken.symbol} for Vault deposit.`
    case Action.stakeApprove:
      return `Approving ${val} ${inputToken.symbol} for Vault staking.`
    case Action.depositAndStakeApprove:
      return `Approving ${val} ${inputToken.symbol} for Vault deposit and staking.`
    case Action.unstakeAndWithdrawApprove:
      return `Approving ${val} ${inputToken.symbol} for Vault unstake and withdrawing.`
    case Action.zapApprove:
      return `Approving ${val} ${inputToken.symbol} for zapping.`
    case Action.asyncRouterApprove:
    case Action.asyncApprove:
      return `Approving ${val} ${inputToken.symbol} for withdrawal.`
    case Action.deposit:
      return `Depositing ${val} ${inputToken.symbol} into the Vault.`
    case Action.stake:
      return `Staking ${val} ${inputToken.symbol} into the Gauge.`
    case Action.depositAndStake:
      return `Deposit and staking ${val} ${inputToken.symbol} into the Vault.`
    case Action.fulfillAndWithdraw:
    case Action.requestFulfillAndWithdraw:
    case Action.withdraw:
      return `Withdrawing ${val} ${inputToken.symbol}.`
    case Action.requestWithdrawal:
      return `Requesting withdrawal of ${val} ${inputToken.symbol}.`
    case Action.cancelRequest:
      return `Cancelling withdrawal request of ${val} ${inputToken.symbol}.`
    case Action.unstake:
      return `Unstaking ${val} ${inputToken.symbol}.`
    case Action.unstakeAndRequestFulfillWithdraw:
    case Action.unstakeAndWithdraw:
      return `Unstaking and withdrawing ${val} ${inputToken.symbol}.`
    case Action.unstakeAndRequestWithdrawal:
      return `Unstaking and requesting withdrawal of ${val} ${inputToken.symbol}.`
    case Action.zap:
      return `Selling ${val} ${inputToken.symbol} for ${outputToken.symbol}.`
    case Action.done:
      return ""
  }
}

export function getLabel(action: Action) {
  switch (action) {
    case Action.depositApprove:
    case Action.stakeApprove:
    case Action.depositAndStakeApprove:
    case Action.unstakeAndWithdrawApprove:
    case Action.zapApprove:
    case Action.asyncApprove:
    case Action.asyncRouterApprove:
      return "Approve"
    case Action.deposit:
      return "Deposit"
    case Action.stake:
      return "Stake"
    case Action.depositAndStake:
      return "Deposit"
    case Action.withdraw:
    case Action.unstakeAndWithdraw:
    case Action.fulfillAndWithdraw:
    case Action.requestFulfillAndWithdraw:
    case Action.unstakeAndRequestFulfillWithdraw:
      return "Withdraw"
    case Action.requestWithdrawal:
    case Action.unstakeAndRequestWithdrawal:
      return "Request Withdrawal"
    case Action.cancelRequest:
      return "Cancel Withdrawal"
    case Action.unstake:
      return "Unstake"
    case Action.zap:
      return "Zap"
    case Action.done:
      return "Done"
  }
}


export function selectActions(action: VaultActionType) {
  switch (action) {
    case VaultActionType.Deposit:
      return [
        Action.depositApprove,
        Action.deposit,
        Action.done
      ]
    case VaultActionType.ZapDeposit:
      return [
        Action.zapApprove,
        Action.zap,
        Action.depositApprove,
        Action.deposit,
        Action.done
      ]
    case VaultActionType.Stake:
      return [
        Action.stakeApprove,
        Action.stake,
        Action.done
      ]
    case VaultActionType.DepositAndStake:
      return [
        Action.depositAndStakeApprove,
        Action.depositAndStake,
        Action.done
      ]
    case VaultActionType.ZapDepositAndStake:
      return [
        Action.zapApprove,
        Action.zap,
        Action.depositAndStakeApprove,
        Action.depositAndStake,
        Action.done
      ]
    case VaultActionType.Withdrawal:
      return [
        Action.withdraw,
        Action.done
      ]
    case VaultActionType.ZapWithdrawal:
      return [
        Action.withdraw,
        Action.zapApprove,
        Action.zap,
        Action.done
      ]
    case VaultActionType.Unstake:
      return [
        Action.unstake,
        Action.done
      ]
    case VaultActionType.UnstakeAndWithdraw:
      return [
        Action.unstakeAndWithdrawApprove,
        Action.unstakeAndWithdraw,
        Action.done
      ]
    case VaultActionType.ZapUnstakeAndWithdraw:
      return [
        Action.unstakeAndWithdrawApprove,
        Action.unstakeAndWithdraw,
        Action.zapApprove,
        Action.zap,
        Action.done
      ]
    case VaultActionType.RequestWithdrawal:
      return [
        Action.asyncApprove,
        Action.requestWithdrawal,
        Action.done
      ]
    case VaultActionType.CancelRequest:
      return [
        Action.cancelRequest,
        Action.done
      ]
    case VaultActionType.FulfillAndWithdraw:
      return [
        Action.asyncRouterApprove,
        Action.fulfillAndWithdraw,
        Action.done
      ]
    case VaultActionType.RequestFulfillAndWithdraw:
      return [
        Action.asyncRouterApprove,
        Action.requestFulfillAndWithdraw,
        Action.done
      ]
    case VaultActionType.UnstakeAndRequestFulfillWithdraw:
      return [
        Action.asyncRouterApprove,
        Action.unstakeAndRequestFulfillWithdraw,
        Action.done
      ]
    case VaultActionType.UnstakeAndRequestWithdrawal:
      return [
        Action.asyncRouterApprove,
        Action.unstakeAndRequestWithdrawal,
        Action.done
      ]
    case VaultActionType.ZapFulfillAndWithdraw:
      return [
        Action.asyncRouterApprove,
        Action.fulfillAndWithdraw,
        Action.zapApprove,
        Action.zap,
        Action.done
      ]
    case VaultActionType.ZapRequestFulfillAndWithdraw:
      return [
        Action.asyncRouterApprove,
        Action.requestFulfillAndWithdraw,
        Action.zapApprove,
        Action.zap,
        Action.done
      ]
    case VaultActionType.ZapUnstakeAndRequestFulfillWithdraw:
      return [
        Action.asyncRouterApprove,
        Action.unstakeAndRequestFulfillWithdraw,
        Action.zapApprove,
        Action.zap,
        Action.done
      ]
  }
}

export function handleVaultInteraction(
  inputToken: Token,
  outputToken: Token,
  amount: bigint,
  action: Action,
  vaultData: VaultData,
  asset: Token,
  vault: Token,
  account: Address,
  zapProvider: ZapProvider,
  clients: Clients,
  tokensAtom: [{ [key: number]: TokenByAddress }, Function]
) {
  switch (action) {
    case Action.depositApprove:
    case Action.asyncApprove:
      return () =>
        handleAllowance({
          token: inputToken.address,
          amount: Number(amount),
          account,
          spender: vaultData.address,
          clients,
        });
    case Action.stakeApprove:
      return () =>
        handleAllowance({
          token: inputToken.address,
          amount: Number(amount),
          account,
          spender: vaultData.gauge!,
          clients,
        });
    case Action.depositAndStakeApprove:
    case Action.unstakeAndWithdrawApprove:
      return () =>
        handleAllowance({
          token: inputToken.address,
          amount: Number(amount),
          account,
          spender: VaultRouterByChain[vaultData.chainId],
          clients,
        });
    case Action.asyncRouterApprove:
      return () =>
        handleAllowance({
          token: inputToken.address,
          amount: Number(amount),
          account,
          spender: AsyncRouterByChain[vaultData.chainId],
          clients,
        });
    case Action.zapApprove:
      return () => handleZapAllowance({
        token: inputToken.address,
        amount: Number(amount),
        account,
        zapProvider,
        clients
      })
    case Action.deposit:
      return () =>
        vaultDeposit({
          chainId: vaultData.chainId,
          vaultData,
          asset: inputToken,
          vault: outputToken,
          account,
          amount,
          clients,
          tokensAtom
        });
    case Action.stake:
      return () =>
        gaugeDeposit({
          vaultData,
          account,
          amount,
          clients,
          tokensAtom
        });
    case Action.depositAndStake:
      return () => vaultDepositAndStake({
        chainId: vaultData.chainId,
        router: VaultRouterByChain[vaultData.chainId],
        vaultData,
        asset,
        vault,
        account,
        amount,
        clients,
        tokensAtom
      })
    case Action.withdraw:
      return () =>
        vaultRedeem({
          chainId: vaultData.chainId,
          vaultData,
          asset,
          vault,
          account,
          amount,
          clients,
          tokensAtom
        });
    case Action.requestWithdrawal:
      return () => vaultRequestRedeem({
        chainId: vaultData.chainId,
        vaultData,
        asset,
        vault,
        account,
        amount,
        clients,
        tokensAtom
      })
    case Action.cancelRequest:
      return () => vaultCancelRedeem({
        chainId: vaultData.chainId,
        vaultData,
        asset,
        vault,
        account,
        amount,
        clients,
        tokensAtom
      })
    case Action.fulfillAndWithdraw:
      return () => vaultRequestFulfillWithdraw({
        chainId: vaultData.chainId,
        vaultData,
        asset,
        vault,
        account,
        amount,
        clients,
        tokensAtom
      })
    case Action.requestFulfillAndWithdraw:
      return () => vaultRequestFulfillWithdraw({
        chainId: vaultData.chainId,
        vaultData,
        asset,
        vault,
        account,
        amount,
        clients,
        tokensAtom
      })
    case Action.unstake:
      return () =>
        gaugeWithdraw({
          vaultData,
          account,
          amount,
          clients,
          tokensAtom
        });
    case Action.unstakeAndWithdraw:
      return () => vaultUnstakeAndWithdraw({
        chainId: vaultData.chainId,
        router: VaultRouterByChain[vaultData.chainId],
        vaultData,
        asset,
        vault,
        account,
        amount,
        clients,
        tokensAtom
      })
    case Action.unstakeAndRequestWithdrawal:
    case Action.unstakeAndRequestFulfillWithdraw:
      // TODO: Implement
      return () => { }
    case Action.zap:
      return () => zap({
        chainId: vaultData.chainId,
        sellToken: inputToken,
        buyToken: outputToken,
        amount: Number(amount),
        account,
        zapProvider,
        slippage: 100,
        tradeTimeout: 300,
        clients,
        tokensAtom
      })
    case Action.done:
      return () => { }
  }
}

export async function updateStats(
  publicClient: PublicClient,
  vault: Token,
  vaultData: VaultData,
  vaults: { [key: number]: VaultData[] },
  setVaults: Function,
  tvl: TVL,
  setTVL: Function,
  tokens: { [key: number]: TokenByAddress },
  networth: Networth,
  setNetworth: Function
) {
  const newSupply = await publicClient?.multicall({
    contracts: [{
      address: vaultData.address,
      abi: VaultAbi,
      functionName: "totalSupply",
    }, {
      address: vaultData.address,
      abi: VaultAbi,
      functionName: "totalAssets"
    }]
  })
  const index = vaults[vaultData.chainId].findIndex(v => v.address === vaultData.address)
  const newNetworkVaults = [...vaults[vaultData.chainId]]
  newNetworkVaults[index] = {
    ...vaultData,
    totalSupply: newSupply[0].result ?? vaultData.totalSupply,
    totalAssets: newSupply[1].result ?? vaultData.totalAssets,
    tvl: Number(formatBalanceUSD(newSupply[0].result ?? vaultData.totalSupply, vault.decimals, vault.price))
  }
  const newVaults = { ...vaults, [vaultData.chainId]: newNetworkVaults }

  setVaults(newVaults)

  const vaultTVL = SUPPORTED_NETWORKS.map(chain => newVaults[chain.id]).flat().reduce((a, b) => a + b.tvl, 0)
  setTVL({
    vault: vaultTVL,
    lockVault: tvl.lockVault,
    stake: tvl.stake,
    total: vaultTVL + tvl.lockVault + tvl.stake
  });

  const vaultNetworth = SUPPORTED_NETWORKS.map(chain =>
    Object.values(tokens[chain.id])).flat().filter(t => t.type === TokenType.Vault || t.type === TokenType.Gauge)
    .reduce((a, b) => a + Number(b.balance.formattedUSD), 0)
  const assetNetworth = SUPPORTED_NETWORKS.map(chain =>
    Object.values(tokens[chain.id])).flat().filter(t => t.type === TokenType.Asset)
    .reduce((a, b) => a + Number(b.balance.formattedUSD), 0)

  setNetworth({
    vault: vaultNetworth,
    lockVault: networth.lockVault,
    wallet: assetNetworth,
    stake: networth.stake,
    total: vaultNetworth + assetNetworth + networth.lockVault + networth.stake
  })
}