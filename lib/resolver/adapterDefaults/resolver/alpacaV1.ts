import axios from "axios";
import { constants } from "ethers";

type VaultsResponse = {
    Vaults: {
        address: string
        baseToken: string
    }[]
}

const TOKEN_ADDRESS = {
    56: "https://api.github.com/repos/alpaca-finance/bsc-alpaca-contract/contents/.mainnet.json",
    250: "https://api.github.com/repos/alpaca-finance/bsc-alpaca-contract/contents/.fantom_mainnet.json",
} as { [chainId: number]: string }

export async function alpacaV1({ chainId, address }: { chainId: number, address: string }): Promise<any[]> {
    const { data } = await axios.get(TOKEN_ADDRESS?.[chainId] || TOKEN_ADDRESS[56])
    const { Vaults: vaults } = JSON.parse(atob(data.content)) as VaultsResponse

    return [ vaults.find(item => item.baseToken.toLowerCase() === address.toLowerCase())?.address || constants.AddressZero ]
}