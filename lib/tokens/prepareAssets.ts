import { Address, PublicClient, erc20Abi, getAddress, maxUint256 } from "viem";
import axios from "axios";
import { TokenByAddress, TokenType } from "@/lib/types";
import { networkMap } from "@/lib/utils/connectors";
import { vcx as getVcxPrice, vcxLp as getVcxLpPrice } from "@/lib/resolver/price/resolver";
import { ALT_NATIVE_ADDRESS, OptionTokenByChain, ST_VCX, VCX, VCX_LP, WrappedOptionTokenByChain } from "@/lib/constants";
import { mainnet } from "viem/chains";

export async function prepareAssets(addresses: Address[], chainId: number, client: PublicClient): Promise<TokenByAddress> {
  const { data: assets } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/assets/tokens/${chainId}.json`
  );

  const { data: priceData } = await axios.get(
    `https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/coins/prices/current/${String(
      addresses.map(
        (address) => `${networkMap[chainId].toLowerCase()}:${address}`
      )
    )}`
  );

  const vcxPrice = await getVcxPrice({ address: VCX, chainId: mainnet.id, client: undefined })
  const vcxLpPrice = chainId === 1 ? await getVcxLpPrice({ address: VCX_LP, chainId: mainnet.id, client: undefined }) : 0

  const ts = await client.multicall({
    contracts: addresses
      .map((address: Address) => {
        return {
          address: address,
          abi: erc20Abi,
          functionName: "totalSupply"
        }
      })
      .flat(),
    allowFailure: true,
  });


  let result: TokenByAddress = {}
  addresses.forEach((address, i) => {
    let tokenPrice = Number(priceData.coins[`${networkMap[chainId].toLowerCase()}:${address}`]?.price) || 0

    tokenPrice = handleTokenPriceExpection(address, tokenPrice, vcxPrice, vcxLpPrice, chainId)

    result[getAddress(address)] = {
      ...assets[getAddress(address)],
      address: getAddress(address),
      price: tokenPrice,
      balance: 0,
      totalSupply: address === ALT_NATIVE_ADDRESS ? Number(maxUint256) : Number(ts[i].result),
      chainId: chainId,
      type: TokenType.Asset
    }
  })

  return result;
}

function handleTokenPriceExpection(address: Address, tokenPrice: number, vcxPrice: number, vcxLpPrice: number, chainId: number): number {
  switch (address) {
    case VCX:
    case ST_VCX:
      return vcxPrice;
    case OptionTokenByChain[chainId]:
    case WrappedOptionTokenByChain[chainId]:
      return vcxPrice * 0.25
    case VCX_LP:
      if (tokenPrice === 0) {
        return vcxLpPrice
      } else {
        return tokenPrice
      }
    default:
      return tokenPrice
  }
}