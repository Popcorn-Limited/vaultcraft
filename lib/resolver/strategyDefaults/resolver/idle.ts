import { StrategyDefaultResolverParams } from "@/lib/resolver/strategyDefaults";
import { getAddress, zeroAddress } from "viem";
import { tranches } from "@/lib/external/idle";

export async function idle({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
  return [getAddress(tranches[chainId][address].cdo) || zeroAddress];
}