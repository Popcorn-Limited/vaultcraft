import axios from "axios";
import { PriceResolverParams } from "..";

const FALLBACK_PRICE = 0.09412

export async function vcx({
  address,
  chainId,
  client,
}: PriceResolverParams): Promise<number> {
  try {
    const { data } = await axios.get("https://api.dexscreener.com/latest/dex/pairs/ethereum/0x577A7f7EE659Aa14Dc16FD384B3F8078E23F1920");

    return Number(data.pair.priceUsd)
  } catch (e) {
    console.log("DEXSCREENER: error fetching vcx price : ", e)
    try {
      const { data } = await axios.get(`https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/coins/prices/current/ethereum:0xce246eea10988c495b4a90a905ee9237a0f91543?searchWidth=4h`);

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
