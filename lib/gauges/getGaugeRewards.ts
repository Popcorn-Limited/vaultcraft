import { Address } from "wagmi";
import { GaugeAbi, ZERO } from "@/lib/constants";
import { PublicClient, createPublicClient, http } from "viem";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";

interface GetGaugeRewardsProps {
  gauges: Address[];
  account: Address;
  publicClient: PublicClient;
  chainId: number;
}

export type GaugeRewards = {
  total: bigint,
  amounts: { amount: bigint, address: Address, chainId: number }[]
}

export default async function getGaugeRewards({ gauges, account, publicClient, chainId }: GetGaugeRewardsProps): Promise<GaugeRewards> {
  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId]),
  })

  const data = await client.multicall({
    contracts: gauges.map((address) => {
      return {
        address,
        abi: GaugeAbi,
        functionName: "claimable_tokens",
        args: [account],
      };
    }),
    allowFailure: true,
  });

  const successfullCalls = data.filter((d) => d.status !== "failure");
  if (successfullCalls.length === 0) return { total: ZERO, amounts: [] };

  const total = successfullCalls.map(entry => (entry.result as bigint)).reduce((acc: bigint, curr: bigint) => acc + (curr || ZERO), ZERO);
  const amounts = successfullCalls.map(entry => (entry.result as bigint)).map((amount, i) => { return { amount: amount, address: gauges[i], chainId } });
  return { total, amounts }
}
