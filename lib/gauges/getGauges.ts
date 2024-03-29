import { Address, PublicClient, getAddress } from "viem";
import { ADDRESS_ZERO, GaugeAbi, GaugeControllerAbi } from "@/lib/constants";

const HIDDEN_GAUGES = [
  "0x38098e3600665168eBE4d827D24D0416efC24799", // Deployment script ran out of gas and somehow added a random address into the gauges which now breaks these calls
  "0xF4c8736c1cf9b03ccB09DA6e8A8312E75CA5B529", // Failed Op Gauge Test
  "0xb5DC74CBF45A53a7E0920885ed506D5B862B119D", // Test Op Gauge 
]

export interface Gauge {
  address: Address;
  lpToken: Address;
  decimals: number;
  balance: number;
  chainId: number;
}

export default async function getGauges({
  address,
  account = ADDRESS_ZERO,
  publicClient,
}: {
  address: Address;
  account?: Address;
  publicClient: PublicClient;
}): Promise<Gauge[]> {
  const nGauges = await publicClient.readContract({
    address: address,
    abi: GaugeControllerAbi,
    functionName: "n_gauges",
  });

  const gaugeController = {
    address: address,
    abi: GaugeControllerAbi,
  } as const;

  let gauges = (await publicClient.multicall({
    contracts: Array(Number(nGauges))
      .fill(undefined)
      .map((item, idx) => {
        return {
          ...gaugeController,
          functionName: "gauges",
          args: [idx],
        };
      }),
    allowFailure: false,
  })) as Address[];

  // @dev Deployment script ran out of gas and somehow added a random address into the gauges which now breaks these calls
  gauges = gauges.filter(
    (gauge) => !HIDDEN_GAUGES.includes(gauge)
  );

  const areGaugesKilled = await publicClient.multicall({
    contracts: gauges.map((gauge: Address) => {
      return {
        address: gauge,
        abi: GaugeAbi,
        functionName: "is_killed",
      };
    }),
    allowFailure: false,
  });

  const aliveGauges = gauges?.filter(
    (gauge: any, idx: number) => !areGaugesKilled[idx]
  );

  const lpTokens = await publicClient.multicall({
    contracts: aliveGauges
      .map((gauge: Address) => {
        const gaugeContract = {
          address: gauge,
          abi: GaugeAbi,
        };
        return [
          {
            ...gaugeContract,
            functionName: "lp_token",
          },
          {
            ...gaugeContract,
            functionName: "decimals",
          },
          {
            ...gaugeContract,
            functionName: "balanceOf",
            args: [account],
          },
        ];
      })
      .flat(),
    allowFailure: false,
  });

  return aliveGauges.map((gauge: Address, i: number) => {
    if (i > 0) i = i * 3;
    return {
      address: getAddress(gauge),
      lpToken: getAddress(lpTokens[i + 0] as Address),
      decimals: Number(lpTokens[i + 1]),
      balance: account === ADDRESS_ZERO ? 0 : Number(lpTokens[i + 2]),
      chainId: publicClient.chain?.id as number,
    };
  });
}
