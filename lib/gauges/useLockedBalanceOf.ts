import { VotingEscrowAbi } from "@/lib/constants";
import { Address, zeroAddress } from "viem";
import { useReadContract } from "wagmi";

export interface LockedBalance {
  amount: bigint;
  end: bigint;
}

export default function useLockedBalanceOf({
  chainId,
  address,
  account,
}: {
  chainId: number;
  address: Address;
  account: Address;
}) {
  return useReadContract({
    address,
    chainId: Number(chainId),
    abi: VotingEscrowAbi,
    functionName: "locked",
    args: (!!account && [account]) || [zeroAddress],
    scopeKey: `lockedBalanceOf:${chainId}:${address}:${account}`,
  });
}
