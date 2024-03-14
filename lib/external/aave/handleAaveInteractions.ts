import { Address } from "viem";
import { handleAllowance } from "@/lib/approve";
import { Clients, Token } from "@/lib/types";
import { AavePoolByChain, borrowFromAave, repayToAave, supplyToAave, withdrawFromAave } from "./interactions";

export enum AaveActionType {
  Supply,
  Withdraw,
  Borrow,
  Repay
}

export interface HandleAaveInteractionProps {
  action: AaveActionType;
  stepCounter: number;
  chainId: number;
  amount: number;
  inputToken: Token;
  account: Address;
  clients: Clients;
}

export default async function handleAaveInteraction({ action, stepCounter, chainId, amount, inputToken, account, clients }: HandleAaveInteractionProps): Promise<() => Promise<boolean>> {
  switch (action) {
    case AaveActionType.Supply:
      if (stepCounter === 0) {
        return () => handleAllowance({ token: inputToken.address, amount, account, spender: AavePoolByChain[chainId], clients })
      } else {
        return () => supplyToAave({ asset: inputToken.address, amount, onBehalfOf: account, chainId, account, clients })
      }
    case AaveActionType.Withdraw:
      return () => withdrawFromAave({ asset: inputToken.address, amount, onBehalfOf: account, chainId, account, clients })
    case AaveActionType.Borrow:
      return () => borrowFromAave({ asset: inputToken.address, amount, onBehalfOf: account, chainId, account, clients })
    case AaveActionType.Repay:
      if (stepCounter === 0) {
        return () => handleAllowance({ token: inputToken.address, amount, account, spender: AavePoolByChain[chainId], clients })
      } else {
        return () => repayToAave({ asset: inputToken.address, amount, onBehalfOf: account, chainId, account, clients })
      }
    default:
      // We should never reach this code. This is here just to make ts happy
      return async () => false
  }
}
