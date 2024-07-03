import { PublicClient, zeroAddress, Address } from "viem";
import { GAUGE_CONTROLLER, GaugeControllerAbi } from "@/lib/constants";

const DAYS = 24 * 60 * 60;

export type VoteData = {
    gauge: Address;
    canVote: boolean;
    lastUserVote: bigint;
    nextVoteTimestamp: bigint;
    currentTimestamp: bigint;
}

export async function hasAlreadyVoted(
    { addresses, publicClient, account = zeroAddress }: { addresses: Address[], publicClient: PublicClient, account?: Address }
): Promise<VoteData[]> {
    const data = await publicClient.multicall({
        contracts: addresses.map((address) => {
            return {
                address: GAUGE_CONTROLLER,
                abi: GaugeControllerAbi,
                functionName: "last_user_vote",
                args: [account, address]
            }
        }),
        allowFailure: false
    }) as any[]
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    return data.map((voteTimestamp: bigint, i: number) => {
        return {
            gauge: addresses[i],
            canVote: voteTimestamp + BigInt(DAYS * 10) < currentTimestamp,
            lastUserVote: voteTimestamp,
            nextVoteTimestamp: voteTimestamp + BigInt(DAYS * 10),
            currentTimestamp: currentTimestamp
        }
    });
}
