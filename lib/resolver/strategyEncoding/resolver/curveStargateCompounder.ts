import { curveApiCallToBytes } from "@/lib/external/curve/router/call";
import { encodeAbiParameters, parseAbiParameters } from "viem";
import { StrategyEncodingResolverParams } from "..";
import { MAX_UINT256 } from "@/lib/constants";

export async function curveStargateCompounder({ chainId, client, address, params }: StrategyEncodingResolverParams): Promise<string> {
  const token = await client.readContract({
    address,
    abi: lpTokenAbi,
    functionName: "token"
  })
  const data = await curveApiCallToBytes({
    depositAsset: token,
    rewardTokens: params[0],
    baseAsset: params[2],
    router: "0x99a58482BD75cbab83b27EC03CA68fF489b5788f",
    minTradeAmounts: params[1].map((value: string) => value === "0" ? MAX_UINT256 : BigInt(value)),
    optionalData: encodeAbiParameters(parseAbiParameters("address"), params[3]),
  });

  return data
}


const lpTokenAbi = [{ "inputs": [], "name": "token", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }] as const
