import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";
import { constants } from "ethers";

const COMPTROLLER_ADDRESS = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";

export async function compoundV2({ chainId, address }: { chainId: number, address: string }) {
    const cTokens = await readContract({
        address: COMPTROLLER_ADDRESS,
        abi: abiComptroller,
        functionName: "getAllMarkets",
        chainId,
        args: []
    }) as `0x${string}`[];

    const underlying = (await readContracts({
        contracts: cTokens.map(item => {
            return {
                address: item,
                abi: abiMarket,
                functionName: "underlying",
                chainId,
                args: []
            }
        })
    }) as string[]).map(item => item ? item.toLowerCase() : item)

    return [
        underlying.includes(address.toLowerCase())
            ? cTokens[underlying.indexOf(address.toLowerCase())]
            : constants.AddressZero
    ]
}

const abiComptroller = [
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
    }
]