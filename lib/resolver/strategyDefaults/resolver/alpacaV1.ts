import { ADDRESS_ZERO } from "@/lib/constants";
import axios from "axios";
import { getAddress } from "viem";
import { StrategyDefaultResolverParams } from "..";

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

export async function alpacaV1({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
    const { data } = await axios.get(TOKEN_ADDRESS?.[chainId] || TOKEN_ADDRESS[56])
    const { Vaults: vaults } = JSON.parse(atob(data.content)) as VaultsResponse

    const vault = vaults.find(item => item.baseToken.toLowerCase() === address.toLowerCase())

    return [vault !== undefined ? getAddress(vault.address) : ADDRESS_ZERO]
}