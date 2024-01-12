import { thisPeriodTimestamp } from "@/lib/gauges/utils";
import { Address, PublicClient, formatEther, formatUnits } from "viem";
import { getVeAddresses } from "@/lib/constants";
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
  vaultData: any
  publicClient: PublicClient;
}

export default async function calculateAPR({ vaultData, publicClient }: CalculateAPRProps): Promise<number[]> {
  /// fetch the price of token0, token1 and LIT in USD
  const vcxPriceInUSD = await llama({ address: "0xcE246eEa10988C495B4A90a905Ee9237a0f91543", chainId: 1 })

  /// calculate the lowerAPR and upperAPR
  let lowerAPR = 0;
  let upperAPR = 0;

  if (vaultData.gauge) {
    const [is_killed, inflation_rate, relative_weight, tokenless_production, working_supply] = await getGaugeData(vaultData.gauge.address, publicClient);
    const gauge_exists = await publicClient.readContract({
      address: GAUGE_CONTROLLER,
      abi: GaugeControllerAbi,
      functionName: 'gauge_exists',
      args: [vaultData.gauge.address]
    })

    /// @dev the price of oVCX is determined by applying the discount factor to the VCX price.
    /// as of this writing, the discount factor of 50% but is subject to change. Additional dev
    /// work is needed to programmatically apply the discount factor at any given point in time.
    const oVcxPriceUSD = vcxPriceInUSD * 0.25;

    if (gauge_exists == true && is_killed == false) {
      const relative_inflation = inflation_rate * relative_weight;
      if (relative_inflation > 0) {
        const annualRewardUSD = relative_inflation * 86400 * 365 * oVcxPriceUSD;
        const effectiveSupply = vaultData.totalSupply > 0 ? (vaultData.totalSupply / (10 ** vaultData.vault.decimals)) : 1;
        const workingSupplyUSD = effectiveSupply * vaultData.vault.price;

        lowerAPR = ((annualRewardUSD / workingSupplyUSD) * 100) / 5;
        upperAPR = (annualRewardUSD / workingSupplyUSD) * 100;
      }
    }
  } else {
    console.log('~~~~~ No Gauge Found ~~~~~');
    return [];
  }

  return [lowerAPR, upperAPR];
}