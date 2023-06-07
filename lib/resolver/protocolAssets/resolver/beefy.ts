import { SUPPORTED_NETWORKS } from "@/lib/connectors";
import transformNetwork from "@/lib/helpers";

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
  const network = transformNetwork(SUPPORTED_NETWORKS.find(chain => chain.id === chainId)?.network)
  const result = await (await fetch(`https://api.beefy.finance/tokens/${network}`)).json() as Asset[];
  // @ts-ignore
  return Object.keys(result).map(key => result[key].address)
}