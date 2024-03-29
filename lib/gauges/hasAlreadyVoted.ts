import { PublicClient, zeroAddress } from "viem";
import { Address } from "wagmi";
import { GaugeControllerAbi, getVeAddresses } from "@/lib/constants";

const DAYS = 24 * 60 * 60;

const { GaugeController: GAUGE_CONTROLLER } = getVeAddresses();

export async function hasAlreadyVoted(
    { addresses, publicClient, account = zeroAddress }: { addresses: Address[], publicClient: PublicClient, account?: Address }
): Promise<{ canCastVote: boolean, canVoteOnGauges: boolean[] }> {
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
    })
    const latest = data.sort((a, b) => Number(b) - Number(a))[0]
    const limitTimestamp = BigInt(Math.floor(Date.now() / 1000) - (DAYS * 10));
    const canVoteOnGauges = data.map((voteTimestamp: bigint) => voteTimestamp < limitTimestamp);
    return { canCastVote: latest < limitTimestamp, canVoteOnGauges };
}