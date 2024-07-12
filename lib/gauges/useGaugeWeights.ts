import { Address, PublicClient, zeroAddress } from "viem";
import { getVotePeriodEndTime } from "@/lib/gauges/utils";
import { GaugeControllerAbi } from "@/lib/constants";
import { VoteUserSlopes } from "@/lib/types";
import { GAUGE_CONTROLLER } from "@/lib/constants/addresses";
import { useReadContracts } from "wagmi";

export default function useGaugeWeights({
  address,
  account,
  chainId,
}: {
  address: Address;
  account: Address;
  chainId: number;
}) {
  const contract = {
    address: GAUGE_CONTROLLER,
    chainId: Number(1),
    abi: GaugeControllerAbi
  }

  return useReadContracts({
    contracts: [
      {
        ...contract,
        functionName: "gauge_relative_weight",
        args: [address],
      },
      {
        ...contract,
        functionName: "gauge_relative_weight",
        args: [address, BigInt(getVotePeriodEndTime() / 1000)],
      },
      {
        ...contract,
        functionName: "vote_user_slopes",
        args: [account || zeroAddress, address],
      },
    ],
    allowFailure: false,
  });
}

export async function voteUserSlopes({
  gaugeAddresses,
  publicClient,
  account = zeroAddress,
}: {
  gaugeAddresses: Address[];
  publicClient: PublicClient;
  account?: Address;
}): Promise<VoteUserSlopes[]> {
  // @ts-ignore
  return publicClient.multicall({
    contracts: gaugeAddresses.map((gaugeAddress) => {
      return {
        address: GAUGE_CONTROLLER,
        abi: GaugeControllerAbi,
        functionName: "vote_user_slopes",
        args: [account, gaugeAddress],
      };
    }),
    allowFailure: false,
  });
}
