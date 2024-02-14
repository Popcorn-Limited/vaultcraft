import { Address } from "viem";
import { handleAllowance } from "@/lib/approve";
import {Clients, Token, VaultData, DepositVaultActionType} from "@/lib/types";
import {
  borrowFromAave,
  supplyToAave,
  vaultDeposit
} from "@/lib/vault/aave/interactionts";

import { FireEventArgs } from "@masa-finance/analytics-sdk";
import { getVeAddresses } from "@/lib/constants";

const { VaultRouter: VAULT_ROUTER } = getVeAddresses()

export const AAVE_UI_DATA_PROVIDER = "0xbd83DdBE37fc91923d59C8c1E0bDe0CccCa332d5"; //OPTIMISM

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
        await handleAllowance({ token: inputToken.address, amount, account, spender: AAVE_UI_DATA_PROVIDER, clients })
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
