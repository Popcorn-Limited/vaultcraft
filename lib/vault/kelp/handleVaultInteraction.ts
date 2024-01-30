import axios from "axios"
import { Address, getAddress } from "viem";
import { handleAllowance } from "@/lib/approve";
import { Clients, Token, VaultData, KelpVaultActionType } from "@/lib/types";
import { vaultDepositAndStake, vaultUnstakeAndWithdraw } from "@/lib/vault/interactions";
import zap from "@/lib/vault/zap";
import { erc20ABI } from "wagmi";
import { FireEventArgs } from "@masa-finance/analytics-sdk";
import { getVeAddresses } from "@/lib/constants";
import { mintEthX, mintRsEth } from "@/lib/vault/kelp/interactionts";

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
  ethX: Token;
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
  ethX,
  fireEvent,
  referral
}: HandleVaultInteractionProps): Promise<() => Promise<boolean>> {
  let postBal = 0;
  console.log({ action, })
  switch (action) {
    case KelpVaultActionType.Deposit:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: VAULT_ROUTER, clients })
        case 1:
          return () => vaultDepositAndStake({ chainId, router: VAULT_ROUTER, vaultData, account, amount, clients, fireEvent, referral })
      }
    case KelpVaultActionType.Withdrawal:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: VAULT_ROUTER, clients })
        case 1:
          return () => vaultUnstakeAndWithdraw({ chainId, router: VAULT_ROUTER, vaultData, account, amount, clients, fireEvent, referral })
      }
    case KelpVaultActionType.ZapDeposit:
      switch (stepCounter) {
        case 0:
          return () => mintEthX({ amount, account, clients })
        case 1:
          postBal = Number(await clients.publicClient.readContract({ address: "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b", abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => handleAllowance({ token: "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b", amount: postBal, account, spender: getAddress("0x036676389e48133B63a802f8635AD39E752D375D"), clients })
        case 2:
          postBal = Number(await clients.publicClient.readContract({ address: "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b", abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => mintRsEth({ amount: postBal - ethX.balance, account, clients })
        case 3:
          postBal = Number(await clients.publicClient.readContract({ address: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7", abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => handleAllowance({ token: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7", amount: postBal, account, spender: getAddress(VAULT_ROUTER), clients })
        case 4:
          postBal = Number(await clients.publicClient.readContract({ address: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7", abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => vaultDepositAndStake({ chainId, router: VAULT_ROUTER, vaultData, account, amount: postBal - vaultData.asset.balance, clients, fireEvent, referral })
      }
    case KelpVaultActionType.EthxZapDeposit:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b", amount, account, spender: getAddress("0x036676389e48133B63a802f8635AD39E752D375D"), clients })
        case 1:
          return () => mintRsEth({ amount, account, clients })
        case 2:
          postBal = Number(await clients.publicClient.readContract({ address: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7", abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => handleAllowance({ token: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7", amount: postBal, account, spender: getAddress(VAULT_ROUTER), clients })
        case 3:
          postBal = Number(await clients.publicClient.readContract({ address: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7", abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => vaultDepositAndStake({ chainId, router: VAULT_ROUTER, vaultData, account, amount: postBal - vaultData.asset.balance, clients, fireEvent, referral })
      }
    case KelpVaultActionType.ZapWithdrawal:
      switch (stepCounter) {
        case 0:
          return () => handleAllowance({ token: inputToken.address, amount, account, spender: VAULT_ROUTER, clients })
        case 1:
          return () => vaultUnstakeAndWithdraw({ chainId, router: VAULT_ROUTER, vaultData, account, amount, clients, fireEvent, referral })
        case 2:
          const ensoWallet = (await axios.get(
            `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${account}`,
            { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } })
          ).data
          return () => handleAllowance({ token: vaultData.asset.address, amount, account, spender: getAddress(ensoWallet.address), clients })
        case 3:
          postBal = Number(await clients.publicClient.readContract({ address: vaultData.asset.address, abi: erc20ABI, functionName: "balanceOf", args: [account] }))
          return () => zap({ chainId, sellToken: vaultData.asset.address, buyToken: outputToken.address, amount: postBal - vaultData.asset.balance, account, slippage, tradeTimeout, clients })
      }
    default:
      // We should never reach this code. This is here just to make ts happy
      return async () => false
  }
}
