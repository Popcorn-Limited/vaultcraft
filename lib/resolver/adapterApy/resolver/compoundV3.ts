import { RPC_PROVIDERS } from "@/lib/connectors";
import { Contract } from "ethers";

const CTOKEN = {
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "0xc3d688B66703497DAA19211EEdff47f25384cdc3", // USDC
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "0xA17581A9E3356d9A858b789D68B4d866e593aE94", // WETH
}

export async function compoundV3({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  const comet = new Contract(
    // @ts-ignore
    CTOKEN[address.toLowerCase()],
    ['function getSupplyRate(uint) public view returns (uint)',
      'function getUtilization() public view returns (uint)'],
    // @ts-ignore
    RPC_PROVIDERS[chainId]
  );

  const secondsPerYear = 60 * 60 * 24 * 365;
  const utilization = await comet.getUtilization();
  const supplyRate = await comet.getSupplyRate(utilization);
  const supplyApr = +(supplyRate).toString() / 1e18 * secondsPerYear * 100;

  return supplyApr;
}
