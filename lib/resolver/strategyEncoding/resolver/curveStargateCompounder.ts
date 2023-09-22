import { RPC_URLS } from "@/lib/connectors";
import { curveApiCallToBytes } from "@/lib/external/curve/router/call";
import { Address, createPublicClient, encodeAbiParameters, http, parseAbiParameters } from "viem";
import { mainnet } from "wagmi";

export async function curveStargateCompounder({ chainId, address, params }: { chainId: number, address: Address, params: any[] }): Promise<string> {
  // TODO -- temp solution, we should pass the client into the function
  const client = createPublicClient({
    chain: mainnet,
    // @ts-ignore
    transport: http(RPC_URLS[chainId])
  })

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
    // @ts-ignore
    minTradeAmounts: params[1].map(value => BigNumber.from(value)),
    optionalData: encodeAbiParameters(parseAbiParameters("address"), params[3]),
  });

  return data
}


const lpTokenAbi = [{ "inputs": [], "name": "token", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }] as const
