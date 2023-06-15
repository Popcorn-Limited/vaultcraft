import { SUPPORTED_NETWORKS } from "@/lib/connectors";
import { transformNetwork } from "@/lib/helpers";

interface Vault {
  tokenAddress: string;
  status: string;
}

export async function beefy({ chainId }: { chainId: number }): Promise<string[]> {
  const network = transformNetwork(SUPPORTED_NETWORKS.find(chain => chain.id === chainId)?.network)
  const result = await (await fetch(`https://api.beefy.finance/vaults/${network}`)).json() as Vault[];

  return result.filter(vault => vault.status === "active").map(vault => vault.tokenAddress);
}