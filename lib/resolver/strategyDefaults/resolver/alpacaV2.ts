import { ADDRESS_ZERO } from "@/lib/constants"
import axios from "axios"
import { getAddress } from "viem";
import { StrategyDefaultResolverParams } from "..";

type MoneyMarketResponse = {
    moneyMarket: {
        markets: {
            debtToken: string
            token: string
            ibToken: string
            interestModel: string
        }[]
    }
}

export async function alpacaV2({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
    const { data } = await axios.get("https://api.github.com/repos/alpaca-finance/alpaca-v2-money-market/contents/.mainnet.json")

    const { moneyMarket } = JSON.parse(atob(data.content)) as MoneyMarketResponse

    const matchingMarket = moneyMarket.markets.find(market => market.token.toLowerCase() === address.toLowerCase())

    return [matchingMarket?.ibToken ? getAddress(matchingMarket?.ibToken) : ADDRESS_ZERO]
}
