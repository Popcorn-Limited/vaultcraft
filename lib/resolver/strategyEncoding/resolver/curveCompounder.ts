import { curveApiCallToBytes } from "@/lib/external/curve/router/call";
import { BigNumber } from "ethers";

export async function curveCompounder({ chainId, address, params }: { chainId: number, address: string, params: any[] }): Promise<string> {
  const data = await curveApiCallToBytes({
    depositAsset: address,
    rewardTokens: params[0],
    baseAsset: params[2],
    router: "0x99a58482BD75cbab83b27EC03CA68fF489b5788f",
    // @ts-ignore
    minTradeAmounts: params[1].map(value => BigNumber.from(value)),
    optionalData: "0x",
  });

  return data
}
