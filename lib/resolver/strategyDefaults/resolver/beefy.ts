import { transformNetwork } from "@/lib/utils/helpers";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
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
  status: "active" | "eol";
  periodFinish: number;
}

export async function beefy({
  chainId,
  client,
  address,
}: StrategyDefaultResolverParams): Promise<any[]> {
  const network = transformNetwork(
    SUPPORTED_NETWORKS.find((chain) => chain.id === chainId)?.name
  ).toLowerCase();

  const vaults = (await (
    await fetch(`https://api.beefy.finance/vaults/${network}`)
  ).json()) as Vault[];
  const boosts = (await (
    await fetch(`https://api.beefy.finance/boosts/${network}`)
  ).json()) as Boost[];

  const vaultAddress = vaults.find(
    (vault) => vault.tokenAddress?.toLowerCase() === address.toLowerCase()
  )?.earnContractAddress;
  let boost = boosts.find(
    (boost) => boost.tokenAddress?.toLowerCase() === vaultAddress?.toLowerCase()
  );

  if (boost) {
    const block = await client.getBlock();
    // @dev void the boost if its payout period is already done
    if (Number(block.timestamp) >= boost.periodFinish) boost = undefined;
  }

  return [
    vaultAddress,
    boost && boost.status === "active"
      ? getAddress(boost.earnContractAddress)
      : ADDRESS_ZERO,
  ];
}
