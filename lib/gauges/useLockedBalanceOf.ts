import { Address, useContractRead } from "wagmi";
import { VotingEscrowAbi } from "@/lib/constants";

export interface LockedBalance {
  amount: bigint;
  end: bigint;
}

export default function useLockedBalanceOf({ chainId, address, account }: { chainId: number, address: Address, account: Address }) {
  return useContractRead({
    address,
    chainId: Number(chainId),
    abi: VotingEscrowAbi,
    functionName: "locked",
    args: (!!account && [account]) || [],
    scopeKey: `lockedBalanceOf:${chainId}:${address}:${account}`,
    enabled: !!(chainId && address && account),
    watch: true
  })
}