import { Address, zeroAddress } from "viem";
import { useContractReads } from "wagmi";
import { getVotePeriodEndTime } from "@/lib/gauges/utils";
import { getVeAddresses } from "@/lib/utils/addresses";
import { GaugeControllerAbi } from "@/lib/constants";

const { GaugeController: GAUGE_CONTROLLER } = getVeAddresses();


export default function useGaugeWeights({ address, account, chainId }: { address: Address, account: Address, chainId: number }) {
  const contract = {
    address: GAUGE_CONTROLLER,
    chainId: Number(chainId),
    abi: GaugeControllerAbi
  }

  return useContractReads({
    contracts: [
      {
        ...contract,
        functionName: "gauge_relative_weight",
        args: [address]
      },
      {
        ...contract,
        functionName: "gauge_relative_weight",
        args: [address, BigInt(getVotePeriodEndTime() / 1000)]
      },
      {
        ...contract,
        functionName: "vote_user_slopes",
        args: [account || zeroAddress, address]
      }
    ],
    enabled: !!address && !!chainId,
    allowFailure: false,
  })
}