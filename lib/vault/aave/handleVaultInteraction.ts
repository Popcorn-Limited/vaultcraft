import axios from "axios"
import { Address, getAddress } from "viem";
import { handleAllowance } from "@/lib/approve";
import {Clients, Token, VaultData, KelpVaultActionType, DepositVaultActionType} from "@/lib/types";
import { vaultDepositAndStake, vaultUnstakeAndWithdraw } from "@/lib/vault/interactions";
import zap from "@/lib/vault/zap";
import { erc20ABI } from "wagmi";
import { FireEventArgs } from "@masa-finance/analytics-sdk";
import { getVeAddresses } from "@/lib/constants";
import { mintEthX, mintRsEth } from "@/lib/vault/kelp/interactionts";

const { VaultRouter: VAULT_ROUTER } = getVeAddresses()

interface HandleVaultInteractionProps {
  stepCounter: number;
  action: DepositVaultActionType;
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
  switch (action) {
    case DepositVaultActionType.Supply:
      await handleAllowance({ token: inputToken.address, amount, account, spender: VAULT_ROUTER, clients })
      //call supply function
      await vaultDepositAndStake({ chainId, router: VAULT_ROUTER, vaultData, account, amount, clients, fireEvent, referral })
    case DepositVaultActionType.Borrow:
      //call borrow function
      await vaultUnstakeAndWithdraw({ chainId, router: VAULT_ROUTER, vaultData, account, amount, clients, fireEvent, referral })
    case DepositVaultActionType.Deposit:
      await handleAllowance({ token: inputToken.address, amount, account, spender: VAULT_ROUTER, clients })
      //call deposit function
      await vaultUnstakeAndWithdraw({ chainId, router: VAULT_ROUTER, vaultData, account, amount, clients, fireEvent, referral })
    default:
      // We should never reach this code. This is here just to make ts happy
      return async () => false
  }
}
