import { handleAllowance } from "@/lib/approve";
import { showErrorToast } from "@/lib/toasts";
import { Address, zeroAddress } from "viem";
import { Clients, ZapProvider } from "@/lib/types";
import { getEnsoSpender } from "./enso";
import { getOneInchSpender } from "./oneInch";
import { getKyberSwapSpender } from "./kyperswap";
import { getParaSwapSpender } from "./paraswap";
import { getOpenOceanSpender } from "./openOcean";
import { RS_ETH_ADAPTER } from "../constants";


export function getZapSpender({ account, chainId, zapProvider }: { account: Address, chainId: number, zapProvider: ZapProvider }): Address {
  switch (zapProvider) {
    case ZapProvider.enso:
      return getEnsoSpender({ account, chainId });
    case ZapProvider.zeroX:
      return zeroAddress
    case ZapProvider.oneInch:
      return getOneInchSpender({ account, chainId });
    case ZapProvider.paraSwap:
      return getParaSwapSpender({ account, chainId });
    case ZapProvider.kyberSwap:
      return getKyberSwapSpender({ account, chainId })
    case ZapProvider.openOcean:
      return getOpenOceanSpender({ account, chainId })
    case ZapProvider.kelp:
      return chainId === 1 ? RS_ETH_ADAPTER : zeroAddress
    default:
      return zeroAddress
  }
}

interface HandleZapAllowanceProps {
  token: Address;
  amount: number;
  account: Address;
  zapProvider: ZapProvider;
  clients: Clients;
}

export async function handleZapAllowance({ token, amount, account, zapProvider, clients }: HandleZapAllowanceProps) {
  if (!clients.walletClient.chain) {
    showErrorToast("Wallet not connected!")
    return false
  }
  const spender = await getZapSpender({ account, chainId: clients.walletClient.chain?.id, zapProvider })
  return handleAllowance({ token, amount, account, spender, clients })
}
