import axios from "axios"
import { Address, getAddress } from "viem";
import { handleAllowance } from "@/lib/approve";
import { SmartVaultActionType, Clients, Token, VaultData } from "@/lib/types";
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultUnstakeAndWithdraw } from "@/lib/vault/interactions";
import zap from "@/lib/vault/zap";
import { gaugeDeposit, gaugeWithdraw } from "@/lib/gauges/interactions";
import { erc20ABI } from "wagmi";
import { FireEventArgs } from "@masa-finance/analytics-sdk";
import { VaultRouterByChain, getVeAddresses } from "@/lib/constants";

interface HandleVaultInteractionProps {
  stepCounter: number;
  action: SmartVaultActionType;
  chainId: number;
  amount: number;
  inputToken: Token;
  outputToken: Token;
  vaultData: VaultData;
  account: Address;
  slippage: number;
  tradeTimeout: number;
  clients: Clients;
  fireEvent?: (type: string, { user_address, network, contract_address, asset_amount, asset_ticker, additionalEventData }: FireEventArgs) => Promise<void>;
  referral?:Address;
}

export default async function handleVaultInteraction({
  action,
  stepCounter,
  chainId,
  amount,
  inputToken,
  outputToken,
  vaultData,
  account,
  slippage,
  tradeTimeout,
  clients,
  fireEvent,
  referral
}: HandleVaultInteractionProps): Promise<() => Promise<boolean>> {
  let postBal = 0;
  switch (action) {
    case SmartVaultActionType.Deposit:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: outputToken.address, clients })
        case 1:
          return () => vaultDeposit({ chainId, vaultData, account, amount, clients, fireEvent, referral })
      }
    case SmartVaultActionType.Withdrawal:
      return () => vaultRedeem({ chainId, vaultData, account, amount, clients })
    case SmartVaultActionType.Stake:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: vaultData.gauge?.address as Address, clients })
        case 1:
          return () => gaugeDeposit({ chainId, address: vaultData.gauge?.address as Address, account, amount, clients })
      }
    case SmartVaultActionType.Unstake:
      return () => gaugeWithdraw({ chainId, address: vaultData.gauge?.address as Address, account, amount, clients })
    case SmartVaultActionType.DepositAndStake:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: VaultRouterByChain[chainId], clients })
        case 1:
          return () => vaultDepositAndStake({ chainId, router: VaultRouterByChain[chainId], vaultData, account, amount, clients, fireEvent, referral })
      }
    case SmartVaultActionType.UnstakeAndWithdraw:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: VaultRouterByChain[chainId], clients })
        case 1:
          return () => vaultUnstakeAndWithdraw({ chainId, router: VaultRouterByChain[chainId], vaultData, account, amount, clients, fireEvent, referral })
      }
    case SmartVaultActionType.ZapDeposit:
      switch (stepCounter) {
        case 0:
          const ensoWallet = (await axios.get(
            `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${account}`,
            { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } })
          ).data
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: getAddress(ensoWallet.address), clients })
        case 1:
          return () => zap({ chainId, sellToken: inputToken.address, buyToken: vaultData.asset.address, amount, account, slippage, tradeTimeout, clients })
        case 2:
          postBal = Number(await clients.publicClient.readContract({ address: vaultData.asset.address, abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => handleAllowance({ token: vaultData.asset.address, amount: postBal - vaultData.asset.balance, account, spender: vaultData.vault.address, clients })
        case 3:
          postBal = Number(await clients.publicClient.readContract({ address: vaultData.asset.address, abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => vaultDeposit({ chainId, vaultData, account, amount: postBal - vaultData.asset.balance, clients })
      }
    case SmartVaultActionType.ZapWithdrawal:
      switch (stepCounter) {
        case 0:
          return () => vaultRedeem({ chainId, vaultData, account, amount, clients })
        case 1:
          const ensoWallet = (await axios.get(
            `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${account}`,
            { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } })
          ).data
          return () => handleAllowance({ token: vaultData.asset.address, amount, account, spender: getAddress(ensoWallet.address), clients })
        case 2:
          postBal = Number(await clients.publicClient.readContract({ address: vaultData.asset.address, abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => zap({ chainId, sellToken: vaultData.asset.address, buyToken: outputToken.address, amount: postBal - vaultData.asset.balance, account, slippage, tradeTimeout, clients })
      }
    case SmartVaultActionType.ZapDepositAndStake:
      switch (stepCounter) {
        case 0:
          const ensoWallet = (await axios.get(
            `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${account}`,
            { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } })
          ).data
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: getAddress(ensoWallet.address), clients })
        case 1:
          return () => zap({ chainId, sellToken: inputToken.address, buyToken: vaultData.asset.address, amount, account, slippage, tradeTimeout, clients })
        case 2:
          postBal = Number(await clients.publicClient.readContract({ address: vaultData.asset.address, abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => handleAllowance({ token: vaultData.asset.address, amount: postBal - vaultData.asset.balance, account, spender: VaultRouterByChain[chainId], clients })
        case 3:
          postBal = Number(await clients.publicClient.readContract({ address: vaultData.asset.address, abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => vaultDepositAndStake({ chainId, router: VaultRouterByChain[chainId], vaultData, account, amount: postBal - vaultData.asset.balance, clients })
      }
    case SmartVaultActionType.ZapUnstakeAndWithdraw:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: VaultRouterByChain[chainId], clients })
        case 1:
          return () => vaultUnstakeAndWithdraw({ chainId, router: VaultRouterByChain[chainId], vaultData, account, amount, clients })
        case 2:
          const ensoWallet = (await axios.get(
            `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${account}`,
            { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } })
          ).data
          return () => handleAllowance({ token: vaultData.asset.address, amount, account, spender: getAddress(ensoWallet.address), clients })
        case 3:
          return () => zap({ chainId, sellToken: vaultData.asset.address, buyToken: outputToken.address, amount, account, slippage, tradeTimeout, clients })
      }
    default:
      // We should never reach this code. This is here just to make ts happy
      return async () => false
  }
}