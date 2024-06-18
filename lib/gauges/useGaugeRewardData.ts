import { Address, createPublicClient, http } from "viem";
import { ChildGaugeAbi, GaugeAbi } from "@/lib/constants";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import * as chains from "viem/chains";
import { useAccount, useContractRead } from "wagmi";

export async function getRewardData(gauge: Address, chainId: number) {
  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId]),
  });

  const rewardLogs = await client.getContractEvents({
    address: gauge,
    abi: chainId === chains.mainnet.id ? GaugeAbi : ChildGaugeAbi,
    eventName: chainId === chains.mainnet.id ? "RewardDistributorUpdated" : "AddReward",
    fromBlock: "earliest",
    toBlock: "latest",
  }) as any[];

  let rewardData = []

  if (rewardLogs.length > 0) {
    rewardData = (await client.multicall({
      contracts: rewardLogs.map(({ args }) => {
        return {
          address: gauge,
          abi: ChildGaugeAbi,
          functionName: "reward_data",
          args: [args.reward_token as Address],
        };
      }),
      allowFailure: false,
    })) as any[];


    const currentTimestamp = Math.floor(Date.now() / 1000);
    return rewardData.map((value, index) => {
      const periodFinish = new Date(Number(value.period_finish) * 1000);
      const rate = Number(value.rate);
      const remainingTime = Number(value.period_finish) - currentTimestamp;

      return {
        rate,
        address: rewardLogs[index].args.reward_token,
        distributor: value.distributor,
        remainingRewards: remainingTime > 0 ? rate * remainingTime : 0,
        periodFinish
      };
    });
  }
  return []
}

export const useClaimableRewards = ({
  gauge,
  chainId,
  rewardToken,
}: {
  gauge: Address;
  rewardToken: Address;
  chainId: number;
}) => {
  const { address } = useAccount();
  return useContractRead({
    abi: GaugeAbi,
    chainId,
    enabled: Boolean(address && gauge && rewardToken),
    address: gauge,
    functionName: "claimable_reward",
    args: [address!, rewardToken],
  });
};

export function AccountClaimableRewards({
  gauge,
  chainId,
  rewardToken,
  children,
}: {
  gauge: Address;
  rewardToken: Address;
  chainId: number;
  children: (
    claimableRewards: ReturnType<typeof useClaimableRewards>
  ) => JSX.Element;
}) {
  const query = useClaimableRewards({
    gauge,
    chainId,
    rewardToken,
  });

  return children(query);
}
