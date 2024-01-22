import axios from "axios"
import { Address, getAddress } from "viem";
import { handleAllowance } from "@/lib/approve";
import { Clients, Token, VaultData, KelpVaultActionType } from "@/lib/types";
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultUnstakeAndWithdraw } from "@/lib/vault/interactions";
import zap from "@/lib/vault/zap";
import { gaugeDeposit, gaugeWithdraw } from "@/lib/gauges/interactions";
import { erc20ABI } from "wagmi";
import { FireEventArgs } from "@masa-finance/analytics-sdk";
import { getVeAddresses } from "@/lib/constants";
import { mintEthX, mintRsEth } from "pages/test";

const { VaultRouter: VAULT_ROUTER } = getVeAddresses()

interface HandleVaultInteractionProps {
  stepCounter: number;
  action: KelpVaultActionType;
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
  referral?: Address;
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
    case KelpVaultActionType.Deposit:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: outputToken.address, clients })
        case 1:
          return () => vaultDeposit({ chainId, vaultData, account, amount, clients, fireEvent, referral })
      }
    case KelpVaultActionType.Withdrawal:
      return () => vaultRedeem({ chainId, vaultData, account, amount, clients })
    case KelpVaultActionType.ZapDeposit:
      switch (stepCounter) {
        case 0:
          return () => mintEthX({ amount, account, clients })
        case 1:
          postBal = Number(await clients.publicClient.readContract({ address: vaultData.asset.address, abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: getAddress("0xcf5EA1b38380f6aF39068375516Daf40Ed70D299"), clients })
        case 2:
          return () => mintRsEth({ amount, account, clients })
        case 3:
          postBal = Number(await clients.publicClient.readContract({ address: vaultData.asset.address, abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: getAddress(vaultData.address), clients })
        case 4:
          return () => vaultDeposit({ chainId, vaultData, account, amount: postBal - vaultData.asset.balance, clients })
      }
    case KelpVaultActionType.EthxZapDeposit:
      switch (stepCounter) {
        case 0:
          postBal = Number(await clients.publicClient.readContract({ address: vaultData.asset.address, abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: getAddress("0xcf5EA1b38380f6aF39068375516Daf40Ed70D299"), clients })
        case 1:
          return () => mintRsEth({ amount, account, clients })
        case 2:
          postBal = Number(await clients.publicClient.readContract({ address: vaultData.asset.address, abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: getAddress(vaultData.address), clients })
        case 3:
          return () => vaultDeposit({ chainId, vaultData, account, amount: postBal - vaultData.asset.balance, clients })
      }
    case KelpVaultActionType.ZapWithdrawal:
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
    default:
      // We should never reach this code. This is here just to make ts happy
      return async () => false
  }
}