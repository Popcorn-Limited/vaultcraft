import { Address } from "wagmi";
import { GaugeAbi, ZERO } from "@/lib/constants";
import { PublicClient } from "viem";

interface GetGaugeRewardsProps {
  gauges: Address[];
  account: Address;
  publicClient: PublicClient;
}

export type GaugeRewards = {
  total: bigint,
  amounts: { amount: bigint, address: Address }[]
}

export default async function getGaugeRewards({ gauges, account, publicClient }: GetGaugeRewardsProps): Promise<GaugeRewards> {
  const data = await publicClient.multicall({
    contracts: gauges.map((address) => {
      return {
        address,
        abi: GaugeAbi,
        functionName: 'claimable_tokens',
        args: [account]
      }
    }),
    allowFailure: false
  })

  const total = data?.reduce((acc: bigint, curr: bigint) => acc + (curr || ZERO), ZERO);
  const amounts = data?.map((amount, i) => { return { amount: amount, address: gauges[i] } });
  return { total, amounts }
}