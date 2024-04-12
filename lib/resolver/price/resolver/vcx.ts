import axios from "axios";
import { PriceResolverParams } from "..";

export async function vcx({
  address,
  chainId,
  client,
}: PriceResolverParams): Promise<number> {
  try {
    const { data } = await axios.get("https://api.dexscreener.com/latest/dex/pairs/ethereum/0x577a7f7ee659aa14dc16fd384b3f8078e23f1920000200000000000000000633-0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2-0xcE246eEa10988C495B4A90a905Ee9237a0f91543");

    return Number(data.pair.priceUsd)
  } catch(e){
    console.log("error fetching vcx price: ",e)
    return 0.09133
  }
}
