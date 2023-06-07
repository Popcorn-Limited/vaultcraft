import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";

const COMPOUND_PROXY_CONTRACT = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";

export async function compound({ chainId }: { chainId: number }): Promise<string[]> {
    const allMarkets = await readContract({
        address: COMPOUND_PROXY_CONTRACT,
        abi: abiProxy,
        chainId: 1337,
        functionName: "getAllMarkets",
        args: []
    }) as `0x${string}`[]

    return await readContracts({
        contracts: allMarkets.map(item => {
            return {
                address: item,
                abi: abiMarket,
                chainId: 1337,
                functionName: "underlying",
                args: []
            }
        })
    }) as string[]
}

const abiProxy = [
    {
        "constant": true,
        "inputs": [],
        "name": "getAllMarkets",
        "outputs": [
            {
                "internalType": "contract CToken[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
]
const abiMarket = [
    {
        "constant": true,
        "inputs": [],
        "name": "underlying",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
]