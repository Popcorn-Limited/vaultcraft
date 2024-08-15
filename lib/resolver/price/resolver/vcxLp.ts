import axios from "axios";
import { PriceResolverParams } from "..";
import { vcx as getVcxPrice, llama } from "@/lib/resolver/price/resolver";
import { BALANCER_VAULT, BalancerVaultAbi, VCX, VCX_LP, VCX_POOL_ID, WETH } from "@/lib/constants";
import { mainnet } from "viem/chains";
import { createPublicClient, erc20Abi, http } from "viem";
import { RPC_URLS } from "@/lib/utils/connectors";

export async function vcxLp({
  address,
  chainId,
  client,
}: PriceResolverParams): Promise<number> {
  client = client || createPublicClient({
    chain: mainnet,
    transport: http(RPC_URLS[mainnet.id]),
  });
  const vcxPrice = await getVcxPrice({ address: VCX, chainId: mainnet.id, client: undefined })
  const ethPrice = await llama({ address: WETH, chainId: mainnet.id, client: undefined })

  // @ts-ignore
  const res: any[] = await client.multicall({
    contracts: [
      {
        address: BALANCER_VAULT,
        abi: BalancerVaultAbi,
        functionName: "getPoolTokens",
        args: [VCX_POOL_ID],
      },
      {
        address: VCX_LP,
        abi: erc20Abi,
        functionName: "totalSupply",
      }
    ],
    allowFailure: false,
  });
  const totalValue = ((Number(res[0][1][0]) / 1e18) * ethPrice) + ((Number(res[0][1][1]) / 1e18) * vcxPrice)
  return (Number(res[1]) / 1e18) * totalValue
}
