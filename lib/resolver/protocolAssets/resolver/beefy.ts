import { SUPPORTED_NETWORKS } from "pages/_app";

interface BeefyVault {
  tokenAddress: string;
  chain: string;
}

export async function beefy({ chainId }: { chainId: number }): Promise<string[]> {
  const network = SUPPORTED_NETWORKS.find(chain => chain.id === chainId)?.network
  const result = await (await fetch("https://api.beefy.finance/vaults")).json() as BeefyVault[];
  return result.filter(vault => vault.chain === network?.toLowerCase()).map(vault => vault.tokenAddress)
}