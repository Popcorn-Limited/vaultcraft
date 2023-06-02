import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";
import { BigNumber } from "ethers";

const PAIR_FACTORY_ADDRESS = "0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746";

export async function velodrome({ chainId }: { chainId: number }) {
    const allPairLength = await readContract({
        address: PAIR_FACTORY_ADDRESS,
        abi: abiFactory,
        functionName: "allPairsLength",
        chainId: 1337,
        args: []
    }) as BigNumber

    const pairs = await readContracts({
        contracts: Array(allPairLength.toNumber()).fill(undefined).map((item, idx) => {
            return {
                address: PAIR_FACTORY_ADDRESS,
                abi: abiFactory,
                functionName: "allPairs",
                chainId: 1337,
                args: [idx]
            }
        })
    }) as string[]

    return pairs
}

const abiFactory = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "allPairs",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "allPairsLength",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
]
