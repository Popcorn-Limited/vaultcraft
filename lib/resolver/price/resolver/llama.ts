import axios from "axios"
import { PriceResolverParams } from "..";
import { networkMap } from "@/lib/utils/connectors";

const BASE_URL = "https://coins.llama.fi/prices/current/"

export async function llama({ address, chainId, client }: PriceResolverParams): Promise<number> {
    const key = `${networkMap[chainId].toLowerCase()}:${address}`
    const { data } = await axios.get(`${BASE_URL}${key}`)

    return Object.keys(data.coins).length === 0 ?
        // Llama didnt find the token, return 0
        0 :
        data.coins[key].price
}
