import { thisPeriodTimestamp } from "@/lib/gauges/utils";
import { Address, PublicClient, formatEther } from "viem";
import { getVeAddresses } from "@/lib/utils/addresses";
import { llama } from "@/lib/resolver/price/resolver";
import { GaugeAbi, GaugeControllerAbi } from "@/lib/constants";

const { GaugeController: GAUGE_CONTROLLER } = getVeAddresses()


async function getGaugeData(gauge: Address, publicClient: PublicClient): Promise<[boolean, number, number, number, number]> {
  const gaugeContract = {
    address: gauge,
    abi: GaugeAbi
  }

  const data = await publicClient.multicall({
    contracts: [
      {
        ...gaugeContract,
        functionName: 'is_killed',
      },
      {
        ...gaugeContract,
        functionName: 'inflation_rate',
      },
      {
        ...gaugeContract,
        functionName: 'getCappedRelativeWeight',
        args: [BigInt(thisPeriodTimestamp())]
      },
      {
        ...gaugeContract,
        functionName: 'tokenless_production',
      },
      {
        ...gaugeContract,
        functionName: 'working_supply',
      },
    ],
    allowFailure: false
  })

  return [data[0], Number(formatEther(data[1])), Number(formatEther(data[2])), Number(data[3]), Number(formatEther(data[4]))];
}

interface CalculateAPRProps {
  vaultPrice: number;
  gauge: Address;
  publicClient: PublicClient;
}

export default async function calculateAPR({ vaultPrice, gauge, publicClient }: CalculateAPRProps): Promise<number[]> {
  /// fetch the price of token0, token1 and LIT in USD
  const popPriceUSD = await llama({ address: "0x6F0fecBC276de8fC69257065fE47C5a03d986394", chainId: 10 })

  /// calculate the lowerAPR and upperAPR
  let lowerAPR = 0;
  let upperAPR = 0;

  if (gauge) {
    const [is_killed, inflation_rate, relative_weight, tokenless_production, working_supply] = await getGaugeData(gauge, publicClient);
    const gauge_exists = await publicClient.readContract({
      address: GAUGE_CONTROLLER,
      abi: GaugeControllerAbi,
      functionName: 'gauge_exists',
      args: [gauge]
    })

    /// @dev the price of oPOP is determined by applying the discount factor to the POP price.
    /// as of this writing, the discount factor of 50% but is subject to change. Additional dev
    /// work is needed to programmatically apply the discount factor at any given point in time.
    const oPopPriceUSD = popPriceUSD * 0.5;

    if (gauge_exists == true && is_killed == false) {
      const relative_inflation = inflation_rate * relative_weight;
      if (relative_inflation > 0) {
        const annualRewardUSD = relative_inflation * 86400 * 365 * oPopPriceUSD;
        const effectiveSupply = working_supply > 0 ? working_supply : 1;
        const workingSupplyUSD = effectiveSupply * vaultPrice;

        lowerAPR = (((annualRewardUSD * tokenless_production) / 100) / workingSupplyUSD) * 100;
        upperAPR = (annualRewardUSD / workingSupplyUSD) * 100;
      }
    }
  } else {
    console.log('~~~~~ No Gauge Found ~~~~~');
    return [];
  }

  return [lowerAPR, upperAPR];
}