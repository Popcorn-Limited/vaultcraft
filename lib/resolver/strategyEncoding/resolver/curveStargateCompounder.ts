import { RPC_PROVIDERS } from "@/lib/connectors";
import { curveApiCallToBytes } from "@/lib/external/curve/router/call";
import { BigNumber, Contract, ethers } from "ethers";

export async function curveStargateCompounder({ chainId, address, params }: { chainId: number, address: string, params: any[] }): Promise<string> {
  const lpToken = new Contract(
    address,
    ["function token() view returns (address)"],
    // @ts-ignore
    RPC_PROVIDERS[chainId])

  const depositAsset = await lpToken.token()

  const data = await curveApiCallToBytes({
    depositAsset: depositAsset,
    rewardTokens: params[0],
    baseAsset: params[2],
    router: "0x99a58482BD75cbab83b27EC03CA68fF489b5788f",
    // @ts-ignore
    minTradeAmounts: params[1].map(value => BigNumber.from(value)),
    optionalData: ethers.utils.defaultAbiCoder.encode(["address"], params[3]),
  });

  return data
}
