import axios from "axios";

const BASE_URL = "https://api.curve.fi/api/getPools"

const ENDPOINTS = {
    1: ["/ethereum/main", "/ethereum/crypto", "/ethereum/factory", "/ethereum/factory-crypto"],
    10: ["/optimism/main", "/optimism/crypto", "/optimism/factory"],
    137: ["/polygon/main", "/polygon/crypto", "/polygon/factory"],
    250: ["/fantom/main", "/fantom/crypto", "/fantom/factory"],
    1337: ["/ethereum/main", "/ethereum/crypto", "/ethereum/factory"],
    42161: ["/arbitrum/main", "/arbitrum/crypto", "/arbitrum/factory"],
} as { [chainId: number]: string[] }

export async function curve({ chainId }: { chainId: number }): Promise<string[]> {
    const pools = (await Promise.all(ENDPOINTS?.[chainId]?.map(async endpoint => {
        const { data } = await axios.get(BASE_URL + endpoint)
        return data?.data?.poolData
    }))).flat() as {
        gaugeAddress?: string
        lpTokenAddress: string
    }[]
    return pools.filter(pool => !!pool?.gaugeAddress).map(pool => pool.lpTokenAddress)
}