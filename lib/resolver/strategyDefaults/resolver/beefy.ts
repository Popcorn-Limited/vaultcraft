import { transformNetwork } from "@/lib/helpers";
import { SUPPORTED_NETWORKS } from "@/lib/connectors";
import { ADDRESS_ZERO } from "@/lib/constants";
import { getAddress } from "viem";
import { StrategyDefaultResolverParams } from "..";

interface Vault {
  tokenAddress: string;
  earnContractAddress: string;
}

interface Boost {
  tokenAddress: string;
  earnContractAddress: string;
  status: "active" | "eol"
}

export async function beefy({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
  const network = transformNetwork(SUPPORTED_NETWORKS.find(chain => chain.id === chainId)?.network)

  const vaults = await (await fetch(`https://api.beefy.finance/vaults/${network}`)).json() as Vault[];
  const boosts = await (await fetch(`https://api.beefy.finance/boosts/${network}`)).json() as Boost[];

  const vaultAddress = vaults.find(vault => vault.tokenAddress.toLowerCase() === address.toLowerCase())?.earnContractAddress;
  const boost = boosts.find(boost => boost.tokenAddress.toLowerCase() === vaultAddress?.toLowerCase());

  return [vaultAddress, boost && boost.status === "active" ? getAddress(boost.earnContractAddress) : ADDRESS_ZERO]
}