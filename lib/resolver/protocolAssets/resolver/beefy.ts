import { SUPPORTED_NETWORKS } from "pages/_app";

interface Asset {
  type: string;
  id: string;
  symbol: string;
  name: string;
  chainId: string;
  oracle: string;
  oracleId: string;
  address: string;
  decimals: number;
}

export async function beefy({ chainId }: { chainId: number }): Promise<string[]> {
  const network = SUPPORTED_NETWORKS.find(chain => chain.id === chainId)?.network
  const result = await (await fetch(`https://api.beefy.finance/tokens/${network}`)).json() as Asset[];
  return result.map(token => token.address)
}