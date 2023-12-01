import { Address, PublicClient } from "viem";
import { VaultRegistryByChain, VaultRegistyAbi } from "../constants";

export default async function getVaultAddresses({ client }: { client: PublicClient }): Promise<Address[]> {
  return client.readContract({
    address: VaultRegistryByChain[client.chain?.id as number],
    abi: VaultRegistyAbi,
    functionName: "getRegisteredAddresses",
  }) as Promise<Address[]>;
}