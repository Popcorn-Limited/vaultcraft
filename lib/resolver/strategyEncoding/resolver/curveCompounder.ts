import { curveApiCallToBytes } from "@/lib/external/curve/router/call";
import { StrategyEncodingResolverParams } from "..";

export async function curveCompounder({ chainId, client, address, params }: StrategyEncodingResolverParams): Promise<string> {
  const data = await curveApiCallToBytes({
    depositAsset: address,
    rewardTokens: params[0],
    baseAsset: params[2],
    router: "0x99a58482BD75cbab83b27EC03CA68fF489b5788f",
    minTradeAmounts: params[1].map((value: any) => BigInt(value)),
    optionalData: "0x",
  });

  return data
}
