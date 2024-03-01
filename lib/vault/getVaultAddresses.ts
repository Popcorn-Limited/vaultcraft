import { Address, PublicClient } from "viem";
import { VaultRegistryByChain, VaultRegistryAbi } from "@/lib/constants";

export default async function getVaultAddresses({
  client,
}: {
  client: PublicClient;
}): Promise<Address[]> {
  return client.readContract({
    address: VaultRegistryByChain[client.chain?.id as number],
    abi: VaultRegistryAbi,
    functionName: "getRegisteredAddresses",
  }) as Promise<Address[]>;
}
