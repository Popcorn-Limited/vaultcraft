import { showLoadingToast, showErrorToast, showSuccessToast } from "@/lib/toasts"
import { Balance, VaultActionType, Token, VaultData, ZapProvider } from "@/lib/types";
import { getZapProvider } from "./zapProvider";
import { Address } from "viem";
import { RS_ETH_ASSETS } from "../constants/addresses";

const ZAP_ACTIONS = [
  VaultActionType.ZapDeposit,
  VaultActionType.ZapDepositAndStake,
  VaultActionType.ZapUnstakeAndWithdraw,
  VaultActionType.ZapWithdrawal,
  VaultActionType.ZapRsETHDeposit
]
const DEPOSIT_ACTIONS = [
  VaultActionType.ZapDeposit,
  VaultActionType.ZapDepositAndStake
]

interface FindZapProviderProps {
  action: VaultActionType
  inputToken: Token;
  outputToken: Token;
  asset: Token;
  inputBalance: Balance;
  zapProvider: ZapProvider;
  account: Address;
  vaultData: VaultData;
  setter: Function;
}

export default async function findZapProvider({
  action,
  inputToken,
  outputToken,
  asset,
  inputBalance,
  zapProvider,
  account,
  vaultData,
  setter
}: FindZapProviderProps): Promise<boolean> {
  const val = Number(inputBalance.value)

  let newZapProvider = zapProvider
  if (newZapProvider === ZapProvider.none && ZAP_ACTIONS.includes(action)) {

    showLoadingToast("Searching for the best price...")

    if (vaultData.address === "0x11eAA7a46afE1023f47040691071e174125366C8" && RS_ETH_ASSETS.includes(inputToken.address)) {
      newZapProvider = ZapProvider.kelp
    } else {
      newZapProvider = await getZapProvider({
        sellToken: DEPOSIT_ACTIONS.includes(action) ? inputToken : asset,
        buyToken: DEPOSIT_ACTIONS.includes(action) ? asset : outputToken,
        amount: val,
        chainId: inputToken.chainId!,
        account,
        feeRecipient: vaultData.metadata.feeRecipient
      })
    }


    setter(newZapProvider)

    if (newZapProvider === ZapProvider.notFound) {
      showErrorToast("Zap not available. Please try a different token.")
      return false
    } else {
      showSuccessToast(`Using ${String(ZapProvider[newZapProvider])} for your zap`)
      return true
    }
  }
  return true
}