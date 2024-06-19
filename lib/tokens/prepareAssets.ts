import { Address, PublicClient, getAddress } from "viem";
import axios from "axios";
import { TokenByAddress, TokenType } from "@/lib/types";
import { networkMap } from "@/lib/utils/connectors";
import { vcx as getVcxPrice } from "@/lib/resolver/price/resolver";
import { OptionTokenByChain, VCX } from "@/lib/constants";
import { erc20ABI, mainnet } from "wagmi";

export async function prepareAssets(addresses: Address[], chainId: number, client: PublicClient): Promise<TokenByAddress> {
  const { data: assets } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/assets/tokens/${chainId}.json`
  );

  const { data: priceData } = await axios.get(
    `https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/coins/prices/current/${String(
      addresses.map(
        (address) => `${networkMap[chainId].toLowerCase()}:${address}`
      )
    )}`
  );

  const vcxPrice = await getVcxPrice({ address: VCX, chainId: mainnet.id, client: undefined })

  const ts = await client.multicall({
    contracts: addresses
      .map((address: Address) => {
        return {
          address: address,
          abi: erc20ABI,
          functionName: "totalSupply"
        }
      })
      .flat(),
    allowFailure: false,
  });


  let result: TokenByAddress = {}
  addresses.forEach((address, i) => {
    let tokenPrice = Number(priceData.coins[`${networkMap[chainId].toLowerCase()}:${address}`]?.price) || 0

    if (address === VCX) {
      tokenPrice = vcxPrice
    } else if (address === OptionTokenByChain[chainId]) {
      tokenPrice = vcxPrice * 0.25
    }

    result[getAddress(address)] = {
      ...assets[getAddress(address)],
      address: getAddress(address),
      price: tokenPrice,
      balance: 0,
      totalSupply: Number(ts[i]),
      chainId: chainId,
      type: TokenType.Asset
    }
  })

  return result;
}