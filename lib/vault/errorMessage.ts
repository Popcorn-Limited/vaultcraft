import { SmartVaultActionType, Token, TokenByAddress, VaultData } from "@/lib/types";

export default function getVaultErrorMessage(
  value: string,
  vaultData: VaultData,
  inputToken: Token,
  outputToken: Token,
  isDeposit: boolean,
  action: SmartVaultActionType,
  tokens: { [key: number]: TokenByAddress }
): string {
  const inputAmount = Number(value) * (10 ** inputToken.decimals);
  const outputAmount = ((Number(value) * Number(inputToken?.price)) / Number(outputToken?.price) || 0) * (10 ** outputToken.decimals)

  // Input > Balance
  if (inputAmount > inputToken.balance) return "Insufficient balance"
  // Input > depositLimit
  if (isDeposit && inputAmount > vaultData.depositLimit) return "Insufficient deposit limit"
  // Input > withdrawalLimit
  if (
    !isDeposit &&
    ((Number(value) * Number(inputToken?.price)) / Number(tokens[vaultData.chainId][vaultData.asset].price) || 0) * (10 ** tokens[vaultData.chainId][vaultData.asset].decimals)
    > vaultData.liquid
  ) return "Insufficient withdrawal limit"

  return ""
}