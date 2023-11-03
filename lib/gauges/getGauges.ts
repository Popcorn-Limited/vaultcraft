import { Address, PublicClient, getAddress } from "viem";
import { ADDRESS_ZERO, GaugeAbi, GaugeControllerAbi } from "@/lib/constants";

export interface Gauge {
  address: Address;
  lpToken: Address;
  decimals: number;
  balance: number;
  chainId: number;
}

export default async function getGauges({ address, account = ADDRESS_ZERO, publicClient }: { address: Address, account?: Address, publicClient: PublicClient }): Promise<Gauge[]> {
  const nGauges = await publicClient.readContract({
    address: address,
    abi: GaugeControllerAbi,
    functionName: 'n_gauges',
  })

  const gaugeController = {
    address: address,
    abi: GaugeControllerAbi
  } as const

  const gauges = await publicClient.multicall({
    contracts: Array(Number(nGauges)).fill(undefined).map((item, idx) => {
      return {
        ...gaugeController,
        functionName: "gauges",
        args: [idx]
      }
    }),
    allowFailure: false
  }) as Address[]

  const areGaugesKilled = await publicClient.multicall({
    contracts: gauges.map((gauge: Address) => {
      return {
        address: gauge,
        abi: GaugeAbi,
        functionName: "is_killed",
      }
    }),
    allowFailure: false
  })

  const aliveGauges = gauges?.filter((gauge: any, idx: number) => !areGaugesKilled[idx])

  const lpTokens = await publicClient.multicall({
    contracts: aliveGauges.map((gauge: Address) => {
      const gaugeContract = {
        address: gauge,
        abi: GaugeAbi,
      }
      return [{
        ...gaugeContract,
        functionName: "lp_token",
      },
      {
        ...gaugeContract,
        functionName: "decimals",
      },
      {
        ...gaugeContract,
        functionName: 'balanceOf',
        args: [account]
      }]
    }).flat(),
    allowFailure: false
  })

  return aliveGauges.map((gauge: Address, i: number) => {
    if (i > 0) i = i * 3
    return {
      address: getAddress(gauge),
      lpToken: getAddress(lpTokens[i + 0] as Address),
      decimals: Number(lpTokens[i + 1]),
      balance: account === ADDRESS_ZERO ? 0 : Number(lpTokens[i + 2]),
      chainId: publicClient.chain?.id as number
    }
  })
}