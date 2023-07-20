import { RPC_PROVIDERS } from "@/lib/connectors";
import { Contract } from "ethers";

const LENDING_POOL = { 1: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" }

export async function aaveV3({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  const lendingPool = new Contract(
    // @ts-ignore
    LENDING_POOL[chainId],
    ["function getReserveData(address asset) view returns (((uint256),uint128,uint128,uint128,uint128,uint128,uint40,uint16,address,address,address,address,uint128,uint128,uint128))"],
    // @ts-ignore
    RPC_PROVIDERS[chainId],
  )

  const reserveData = await lendingPool.getReserveData(address);
  return Number(reserveData[2]) / 1e25;
};
