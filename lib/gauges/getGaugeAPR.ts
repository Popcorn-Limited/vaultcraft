import axios from "axios";
import { Address } from "viem";
import { Token } from "../types.js";

interface GetAPRProps {
  vaultData: {
    gauge?: Token;
  };
}

type GaugeData = {
  [key: Address]: {
    address: Address;
    vault: Address;
    lowerAPR: number;
    upperAPR: number;
  };
};

export default async function getAPR({ vaultData }: GetAPRProps): Promise<number[]> {
  if (vaultData.gauge) {
    const gaugeApyData = (await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/gauge-apy-data.json`)).data as GaugeData;
    const gauge = gaugeApyData[vaultData.gauge.address];
    if (!gauge) {
      return [];
    }

    return [gauge.lowerAPR, gauge.upperAPR];
  } else {
    console.log('~~~~~ No Gauge Found ~~~~~');
    return [];
  }
}