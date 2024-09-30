import { SmartVaultActionType, Token, VaultData } from "@/lib/types";

export default function getVaultErrorMessage(value: string, vaultData: VaultData, inputToken: Token, outputToken: Token, isDeposit: boolean, action: SmartVaultActionType): string {
  const inputAmount = Number(value) * (10 ** inputToken.decimals);
  const outputAmount = ((Number(value) * Number(inputToken?.price)) / Number(outputToken?.price) || 0) * (10 ** outputToken.decimals)

  // Input > Balance
  if (inputAmount > inputToken.balance) return "Insufficient balance"
  // Input > depositLimit
  if (isDeposit && inputAmount > vaultData.depositLimit) return "Deposit Limit"
  // Input > withdrawalLimit
  if (!isDeposit && inputAmount > vaultData.liquid) return "Withdrawal Limit"

  return ""
}