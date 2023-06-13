import axios from "axios"

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

export async function alpacaV2({ chainId }: { chainId: number }) {
    const { data } = await axios.get("https://api.github.com/repos/alpaca-finance/alpaca-v2-money-market/contents/.mainnet.json")

    const { moneyMarket } = JSON.parse(atob(data.content)) as MoneyMarketResponse

    return moneyMarket?.markets?.map(market => market.token) ?? []
}