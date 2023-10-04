import { curveApiCallToBytes } from "@/lib/external/curve/router/call";
import { StrategyEncodingResolverParams } from "..";
import { MAX_UINT256 } from "@/lib/constants";

export async function curveCompounder({ chainId, client, address, params }: StrategyEncodingResolverParams): Promise<string> {
  const data = await curveApiCallToBytes({
    depositAsset: address,
    rewardTokens: params[0],
    baseAsset: params[2],
    router: "0x99a58482BD75cbab83b27EC03CA68fF489b5788f",
    minTradeAmounts: params[1].map((value: string) => "0" ? MAX_UINT256 : BigInt(value)),
    optionalData: "",
  });

  return data
}
