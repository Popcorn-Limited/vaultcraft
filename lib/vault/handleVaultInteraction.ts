import axios from "axios"
import { Address, getAddress } from "viem";
import { handleAllowance } from "../approve";
import { ActionType, Clients, Token, VaultData } from "../types";
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultUnstakeAndWithdraw } from "./interactions";
import zap from "./zap";
import { getVeAddresses } from "../utils/addresses";
import { gaugeDeposit, gaugeWithdraw } from "../gauges/interactions";
import { erc20ABI } from "wagmi";
import { FireEventArgs } from "@masa-finance/analytics-sdk";

const { VaultRouter: VAULT_ROUTER } = getVeAddresses()

interface HandleVaultInteractionProps {
  stepCounter: number;
  action: ActionType;
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
    case ActionType.Deposit:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: outputToken.address, clients })
        case 1:
          return () => vaultDeposit({ chainId, vaultData, account, amount, clients, fireEvent, referral })
      }
    case ActionType.Withdrawal:
      return () => vaultRedeem({ chainId, vaultData, account, amount, clients })
    case ActionType.Stake:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: vaultData.gauge?.address as Address, clients })
        case 1:
          return () => gaugeDeposit({ chainId, address: vaultData.gauge?.address as Address, account, amount, clients })
      }
    case ActionType.Unstake:
      return () => gaugeWithdraw({ chainId, address: vaultData.gauge?.address as Address, account, amount, clients })
    case ActionType.DepositAndStake:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: VAULT_ROUTER, clients })
        case 1:
          return () => vaultDepositAndStake({ chainId, router: VAULT_ROUTER, vaultData, account, amount, clients, fireEvent, referral })
      }
    case ActionType.UnstakeAndWithdraw:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: VAULT_ROUTER, clients })
        case 1:
          return () => vaultUnstakeAndWithdraw({ chainId, router: VAULT_ROUTER, vaultData, account, amount, clients, fireEvent, referral })
      }
    case ActionType.ZapDeposit:
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
    case ActionType.ZapWithdrawal:
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
    case ActionType.ZapDepositAndStake:
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
          return () => handleAllowance({ token: vaultData.asset.address, amount: postBal - vaultData.asset.balance, account, spender: VAULT_ROUTER, clients })
        case 3:
          postBal = Number(await clients.publicClient.readContract({ address: vaultData.asset.address, abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => vaultDepositAndStake({ chainId, router: VAULT_ROUTER, vaultData, account, amount: postBal - vaultData.asset.balance, clients })
      }
    case ActionType.ZapUnstakeAndWithdraw:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: VAULT_ROUTER, clients })
        case 1:
          return () => vaultUnstakeAndWithdraw({ chainId, router: VAULT_ROUTER, vaultData, account, amount, clients })
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