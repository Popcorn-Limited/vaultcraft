import { Address } from "viem";
import { handleAllowance } from "@/lib/approve";
import {Clients, Token, VaultData, DepositVaultActionType} from "@/lib/types";
import {
  borrowFromAave,
  supplyToAave,
  vaultDeposit
} from "@/lib/vault/interactions";

import { FireEventArgs } from "@masa-finance/analytics-sdk";
import { getVeAddresses } from "@/lib/constants";

const { VaultRouter: VAULT_ROUTER } = getVeAddresses()

const AAVE_POOL_PROXY = "0xcC6114B983E4Ed2737E9BD3961c9924e6216c704";

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
  switch (action) {
    case DepositVaultActionType.Supply:
      return async (): Promise<boolean> => {
        await handleAllowance({ token: inputToken.address, amount, account, spender: AAVE_POOL_PROXY, clients })
        await supplyToAave({asset: inputToken.address, amount, onBehalfOf: account, chainId, account, clients})
        return true
      }
    case DepositVaultActionType.Borrow:
      return async (): Promise<boolean> => {
        await borrowFromAave({asset: inputToken.address, amount, onBehalfOf: account, chainId, account, clients})
        return true
      }
    case DepositVaultActionType.Deposit:
      return async (): Promise<boolean> => {
        await handleAllowance({ token: inputToken.address, amount, account, spender: VAULT_ROUTER, clients })
        await vaultDeposit({ chainId, vaultData, account, amount, clients })
        return true
      }
    default:
      // We should never reach this code. This is here just to make ts happy
      return async () => false
  }
}
