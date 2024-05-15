import axios from "axios";
import { PriceResolverParams } from "..";

const FALLBACK_PRICE = 0.084624

export async function vcx({
  address,
  chainId,
  client,
}: PriceResolverParams): Promise<number> {
  try {
    const { data } = await axios.get("https://api.dexscreener.com/latest/dex/pairs/ethereum/0x577a7f7ee659aa14dc16fd384b3f8078e23f1920000200000000000000000633-0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2-0xcE246eEa10988C495B4A90a905Ee9237a0f91543");

    return Number(data.pair.priceUsd)
  } catch (e) {
    console.log("DEXSCREENER: error fetching vcx price : ", e)
    try {
      const { data } = await axios.get("https://coins.llama.fi/prices/current/ethereum:0xce246eea10988c495b4a90a905ee9237a0f91543?searchWidth=4h");

      return Object.keys(data.coins).length === 0
        // Llama didnt find the token, return fallback
        ? FALLBACK_PRICE
        : data.coins["ethereum:0xce246eea10988c495b4a90a905ee9237a0f91543"].price;
    } catch (e) {
      console.log("DEFILLAMA: error fetching vcx price : ", e)
      return FALLBACK_PRICE
    }
  }
}
