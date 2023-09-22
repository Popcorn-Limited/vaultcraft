import { localhost, mainnet } from "wagmi/chains";
import StrategyDefaultResolvers from ".";
import { Address, getAddress } from "viem";

export async function resolveStrategyDefaults({ chainId, address, resolver }: { chainId: number, address: Address, resolver?: string }): Promise<any[]> {
  if (chainId === localhost.id) chainId = mainnet.id;

  try {
    return resolver ?
      StrategyDefaultResolvers[resolver]({ chainId, address: getAddress(address) })
      : StrategyDefaultResolvers.default({ chainId, address: getAddress(address) })
  } catch (e) {
    console.log(`resolveStrategyDefaults-${chainId}-${address}-${resolver}`, e)
    return []
  }
}