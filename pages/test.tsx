import { getVotePeriodEndTime } from "@/lib/gauges/utils"
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { AnyToAnyDepositorAbi, AssetPushOracleAbi, AssetPushOracleByChain, VaultAbi } from "@/lib/constants";
import { usePublicClient } from "wagmi";

export default function Test() {
  const publicClient = usePublicClient({ chainId: 42161 });
  publicClient?.getTransactionReceipt({
    hash: '0x2c502ff43d5225e386073eff4da29a4b896651bd08421e89ee6bc852dcb6f682'
  }).then(res => console.log(res))
  return <></>
}