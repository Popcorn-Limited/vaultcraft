import { handleAllowance } from "@/lib/approve"
import { Networth, TVL, } from "@/lib/atoms"
import { VaultRouterByChain } from "@/lib/constants"
import { gaugeDeposit, gaugeWithdraw } from "@/lib/gauges/interactions"
import { Clients, SmartVaultActionType, Token, TokenByAddress, TokenType, VaultData, ZapProvider } from "@/lib/types"
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors"
import { formatNumber } from "@/lib/utils/formatBigNumber"
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultRequestWithdraw, vaultUnstakeAndRequestWithdraw, vaultUnstakeAndWithdraw } from "@/lib/vault/interactions"
import zap, { handleZapAllowance } from "@/lib/vault/zap"
import { Address, erc20Abi, PublicClient } from "viem"

export function getDescription(inputToken: Token, outputToken: Token, amount: number, action: Action, vaultData: VaultData) {
  const val = formatNumber(amount / (10 ** inputToken.decimals))
  switch (action) {
    case Action.depositApprove:
      return `Approving ${val} ${inputToken.symbol} for Vault deposit.`
    case Action.stakeApprove:
      return `Approving ${val} ${inputToken.symbol} for Vault staking.`
    case Action.requestWithdrawApprove:
      return `Approving ${val} ${inputToken.symbol} to request a vault withdrawal.`
    case Action.depositAndStakeApprove:
      return `Approving ${val} ${inputToken.symbol} for Vault deposit and staking.`
    case Action.unstakeAndWithdrawApprove:
      return `Approving ${val} ${inputToken.symbol} for Vault unstake and withdrawing.`
    case Action.unstakeAndRequestWithdrawApprove:
      return `Approving ${val} ${inputToken.symbol} to unstake and request a vault withdrawal.`
    case Action.zapApprove:
      return `Approving ${val} ${inputToken.symbol} for zapping.`
    case Action.deposit:
      return `Depositing ${val} ${inputToken.symbol} into the Vault.`
    case Action.stake:
      return `Staking ${val} ${inputToken.symbol} into the Gauge.`
    case Action.depositAndStake:
      return `Deposit and staking ${val} ${inputToken.symbol} into the Vault.`
    case Action.withdraw:
      return `Withdrawing ${val} ${inputToken.symbol}.`
    case Action.requestWithdraw:
      return `Requesting withdrawl of ${val} ${inputToken.symbol}.`
    case Action.unstake:
      return `Unstaking ${val} ${inputToken.symbol}.`
    case Action.unstakeAndWithdraw:
      return `Withdraw and unstaking ${val} ${inputToken.symbol}.`
    case Action.unstakeAndRequestWithdraw:
      return `Unstaking ${val} ${inputToken.symbol} and requesting withdrawal.`
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
    case Action.requestWithdrawApprove:
    case Action.depositAndStakeApprove:
    case Action.unstakeAndWithdrawApprove:
    case Action.unstakeAndRequestWithdrawApprove:
    case Action.zapApprove:
      return "Approve"
    case Action.deposit:
      return "Deposit"
    case Action.stake:
      return "Stake"
    case Action.depositAndStake:
      return "Deposit"
    case Action.withdraw:
    case Action.unstakeAndWithdraw:
      return "Withdraw"
    case Action.requestWithdraw:
    case Action.unstakeAndRequestWithdraw:
      return "Request Withdraw"
    case Action.unstake:
      return "Unstake"
    case Action.zap:
      return "Zap"
    case Action.done:
      return "Done"
  }
}


export function selectActions(action: SmartVaultActionType) {
  switch (action) {
    case SmartVaultActionType.Deposit:
      return [
        Action.depositApprove,
        Action.deposit,
        Action.done
      ]
    case SmartVaultActionType.ZapDeposit:
      return [
        Action.zapApprove,
        Action.zap,
        Action.depositApprove,
        Action.deposit,
        Action.done
      ]
    case SmartVaultActionType.Stake:
      return [
        Action.stakeApprove,
        Action.stake,
        Action.done
      ]
    case SmartVaultActionType.DepositAndStake:
      return [
        Action.depositAndStakeApprove,
        Action.depositAndStake,
        Action.done
      ]
    case SmartVaultActionType.ZapDepositAndStake:
      return [
        Action.zapApprove,
        Action.zap,
        Action.depositAndStakeApprove,
        Action.depositAndStake,
        Action.done
      ]
    case SmartVaultActionType.Withdrawal:
      return [
        Action.withdraw,
        Action.done
      ]
    case SmartVaultActionType.RequestWithdrawal:
      return [
        Action.requestWithdrawApprove,
        Action.requestWithdraw,
        Action.done
      ]
    case SmartVaultActionType.ZapWithdrawal:
      return [
        Action.withdraw,
        Action.zapApprove,
        Action.zap,
        Action.done
      ]
    case SmartVaultActionType.Unstake:
      return [
        Action.unstake,
        Action.done
      ]
    case SmartVaultActionType.UnstakeAndWithdraw:
      return [
        Action.unstakeAndWithdrawApprove,
        Action.unstakeAndWithdraw,
        Action.done
      ]
    case SmartVaultActionType.UnstakeAndRequestWithdrawal:
      return [
        Action.unstakeAndRequestWithdrawApprove,
        Action.unstakeAndRequestWithdraw,
        Action.done
      ]
    case SmartVaultActionType.ZapUnstakeAndWithdraw:
      return [
        Action.unstakeAndWithdrawApprove,
        Action.unstakeAndWithdraw,
        Action.zapApprove,
        Action.zap,
        Action.done
      ]
  }
}

export function handleInteraction(
  inputToken: Token,
  outputToken: Token,
  amount: number,
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
      return () =>
        handleAllowance({
          token: inputToken.address,
          amount,
          account,
          spender: vaultData.address,
          clients,
        });
    case Action.stakeApprove:
      return () =>
        handleAllowance({
          token: inputToken.address,
          amount,
          account,
          spender: vaultData.gauge!,
          clients,
        });
    case Action.requestWithdrawApprove:
    case Action.depositAndStakeApprove:
    case Action.unstakeAndWithdrawApprove:
    case Action.unstakeAndRequestWithdrawApprove:
      return () =>
        handleAllowance({
          token: inputToken.address,
          amount,
          account,
          spender: VaultRouterByChain[vaultData.chainId],
          clients,
        });
    case Action.zapApprove:
      return () => handleZapAllowance({
        token: inputToken.address,
        amount,
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
          fireEvent: undefined,
          referral: undefined,
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
        fireEvent: undefined,
        referral: undefined,
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
          fireEvent: undefined,
          referral: undefined,
          tokensAtom
        });
    case Action.requestWithdraw:
      return () =>
        vaultRequestWithdraw({
          chainId: vaultData.chainId,
          router: VaultRouterByChain[vaultData.chainId],
          vaultData,
          asset,
          vault,
          account,
          amount,
          clients,
          fireEvent: undefined,
          referral: undefined,
          tokensAtom
        });
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
        fireEvent: undefined,
        referral: undefined,
        tokensAtom
      })
    case Action.unstakeAndRequestWithdraw:
      return () =>
        vaultUnstakeAndRequestWithdraw({
          chainId: vaultData.chainId,
          router: VaultRouterByChain[vaultData.chainId],
          vaultData,
          asset,
          vault,
          account,
          amount,
          clients,
          fireEvent: undefined,
          referral: undefined,
          tokensAtom
        });
    case Action.zap:
      return () => zap({
        chainId: vaultData.chainId,
        sellToken: inputToken,
        buyToken: outputToken,
        amount,
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
  const newSupply = await publicClient?.readContract({
    address: vaultData.address,
    abi: erc20Abi,
    functionName: "totalSupply"
  })
  const index = vaults[vaultData.chainId].findIndex(v => v.address === vaultData.address)
  const newNetworkVaults = [...vaults[vaultData.chainId]]
  newNetworkVaults[index] = {
    ...vaultData,
    totalSupply: Number(newSupply),
    tvl: (Number(newSupply) * vault.price) / (10 ** vault.decimals)
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
    .reduce((a, b) => a + ((b.balance / (10 ** b.decimals)) * b.price), 0)
  const assetNetworth = SUPPORTED_NETWORKS.map(chain =>
    Object.values(tokens[chain.id])).flat().filter(t => t.type === TokenType.Asset)
    .reduce((a, b) => a + ((b.balance / (10 ** b.decimals)) * b.price), 0)

  setNetworth({
    vault: vaultNetworth,
    lockVault: networth.lockVault,
    wallet: assetNetworth,
    stake: networth.stake,
    total: vaultNetworth + assetNetworth + networth.lockVault + networth.stake
  })
}

export enum Action {
  depositApprove,
  stakeApprove,
  requestWithdrawApprove,
  depositAndStakeApprove,
  unstakeAndWithdrawApprove,
  unstakeAndRequestWithdrawApprove,
  zapApprove,
  deposit,
  stake,
  depositAndStake,
  withdraw,
  requestWithdraw,
  unstake,
  unstakeAndWithdraw,
  unstakeAndRequestWithdraw,
  zap,
  done
}
