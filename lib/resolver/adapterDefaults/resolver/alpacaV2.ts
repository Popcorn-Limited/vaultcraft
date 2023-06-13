import { constants } from "ethers";

export async function alpacaV2({ chainId, address }: { chainId: number, address: string }) {
    const { moneyMarket } = await fetch("https://api.github.com/repos/alpaca-finance/alpaca-v2-money-market/contents/.mainnet.json")
        .then(res => res.json())
        .then(res => JSON.parse(atob(res.content)))

    const { markets } = moneyMarket as {
        markets: {
            debtToken: string
            token: string
            ibToken: string
            interestModel: string
        }[]
    }

    const matchingMarket = markets.find(market => market.token.toLowerCase() === address.toLowerCase())

    return [ matchingMarket?.ibToken || constants.AddressZero ]
}