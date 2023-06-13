import axios from "axios"
import { constants } from "ethers";

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

export async function alpacaV2({ chainId, address }: { chainId: number, address: string }) {
    const { data } = await axios.get("https://api.github.com/repos/alpaca-finance/alpaca-v2-money-market/contents/.mainnet.json")

    const { moneyMarket } = JSON.parse(atob(data.content)) as MoneyMarketResponse

    const matchingMarket = moneyMarket.markets.find(market => market.token.toLowerCase() === address.toLowerCase())

    return [ matchingMarket?.ibToken || constants.AddressZero ]
}
