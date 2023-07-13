import { RPC_PROVIDERS } from "@/lib/connectors";
import { Contract } from "ethers";

const LENDING_POOL = { 1: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9" }

export async function aaveV2({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  const lendingPool = new Contract(
    // @ts-ignore
    LENDING_POOL[chainId],
    ["function getReserveData(address asset) view returns (((uint256),uint128,uint128,uint128,uint128,uint128,uint40,address,address,address,address,uint8))"],
    // @ts-ignore
    RPC_PROVIDERS[chainId],
  )

  const reserveData = await lendingPool.getReserveData(address);
  // divided by 1e27 * 100 for percent
  return Number(reserveData[3]) / 1e25;
};
