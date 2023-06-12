export async function alpacaV2({ chainId }: { chainId: number }) {
    const { moneyMarket } = await fetch("https://api.github.com/repos/alpaca-finance/alpaca-v2-money-market/contents/.mainnet.json")
        .then(res => res.json())
        .then(res => JSON.parse(atob(res.content)))

    const { markets } = moneyMarket as {
        markets: {
            debtToken: string
        }[]
    }

    console.log(markets, markets.map(market => market.debtToken))
}