import { Address, createPublicClient, extractChain, http } from "viem";
import { GaugeAbi } from "@/lib/constants";
import { RPC_URLS } from "@/lib/utils/connectors";
import * as chains from "viem/chains";
import { useAccount, useContractRead, useQuery } from "wagmi";
import { PropsWithChildren } from "react";

export async function getRewardData(gauge: Address, chainId: number) {
  const client = createPublicClient({
    chain: extractChain({
      chains: Object.values(chains),
      // @ts-ignore
      id: chainId,
    }),
    transport: http(RPC_URLS[chainId]),
  });

  const rewardLogs = await client.getContractEvents({
    address: gauge,
    abi: GaugeAbi,
    eventName: "RewardDistributorUpdated",
    fromBlock: "earliest",
    toBlock: "latest",
  });

  /*
    distributor: address
    period_finish: uint256
    rate: uint256
    last_update: uint256
    integral: uint256
   */

  let rewardData: Array<[string, bigint, bigint, bigint, bigint]> = [];

  if (rewardLogs.length > 0) {
    rewardData = (await client.multicall({
      contracts: rewardLogs.map(({ args }) => {
        return {
          address: gauge,
          abi: GaugeAbi,
          functionName: "reward_data",
          args: [args.reward_token],
        };
      }),
      allowFailure: false,
    })) as any[];
  }

  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
  return rewardData.map((value, index) => {
    const periodFinish = value[1];
    const rate = value[2];
    const remainingTime = value[1] - currentTimestamp;

    return {
      rate,
      address: rewardLogs[index].args.reward_token,
      distributor: value[0],
      remainingRewards: remainingTime > 0 ? rate * remainingTime : BigInt(0),
      // https://github.com/Popcorn-Limited/gauges/blob/5eeabf66d2598b87e7424a8910b6249043d4a2da/vyper_contracts/ChildGauge.vy#L653
      periodFinish,
      lastUpdate: value[3],
      integral: value[4],
    };
  });
}

export function useRewardData(gauge: Address, chainId: number) {
  return useQuery(["rewardData", gauge], () => getRewardData(gauge, chainId), {
    enabled: Boolean(gauge && chainId),
  });
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
