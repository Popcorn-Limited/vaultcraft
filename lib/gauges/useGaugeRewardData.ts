import { Address, createPublicClient, http } from "viem";
import * as chains from "viem/chains";
import { ChildGaugeAbi, GaugeAbi } from "@/lib/constants";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { ClaimableReward, TokenByAddress } from "@/lib/types";

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
      const rate = Number(value.rate) / 1e18;
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



export async function getClaimableRewards({ gauge, account, tokens, chainId }: { gauge: Address; account: Address; tokens: TokenByAddress, chainId: number; }):
  Promise<ClaimableReward[]> {
  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId]),
  })

  const rewardLogs = await client.getContractEvents({
    address: gauge,
    abi: chainId === chains.mainnet.id ? GaugeAbi : ChildGaugeAbi,
    eventName: chainId === chains.mainnet.id ? "RewardDistributorUpdated" : "AddReward",
    fromBlock: "earliest",
    toBlock: "latest",
  }) as any[];

  if (rewardLogs.length > 0) {
    const rewardData = (await client.multicall({
      contracts: rewardLogs.map(({ args }) => {
        return {
          address: gauge,
          abi: ChildGaugeAbi,
          functionName: "claimable_reward",
          args: [account, args.reward_token as Address],
        };
      }),
      allowFailure: false,
    })) as any[];
    return rewardData.map((val, i) => {
      const rewardToken = tokens[rewardLogs[i].args.reward_token]
      const amount = Number(val) / (10 ** rewardToken.decimals);
      return {
        token: rewardToken,
        amount: amount,
        value: amount * rewardToken.price
      }
    })
  }
  return []
}