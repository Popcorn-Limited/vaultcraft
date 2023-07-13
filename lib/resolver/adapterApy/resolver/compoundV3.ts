import { RPC_PROVIDERS } from "@/lib/connectors";
import { Contract } from "ethers";

const CTOKEN = {
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "0x528c57A87706C31765001779168b42f24c694E1b", // USDC
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "0x1a7E64b593a9B8796e88a7489a2CEb6d079C850d", // WETH
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
  const utilization = await comet.callStatic.getUtilization();
  const supplyRate = await comet.callStatic.getSupplyRate(utilization);
  const supplyApr = +(supplyRate).toString() / 1e18 * secondsPerYear * 100;
  
  return supplyApr;
}
