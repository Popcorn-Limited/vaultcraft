import { compoundV2Apy } from "./compoundV2";

export async function flux({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  return compoundV2Apy({ address, chainId, resolver: "flux" })
}
