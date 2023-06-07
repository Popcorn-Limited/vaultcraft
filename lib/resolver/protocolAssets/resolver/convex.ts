import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";
import { BigNumber } from "ethers";

const CONVEX_BOOSTER_ADDRESS = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31"

export async function convex({ chainId }: { chainId: number }) {
    const poolLength = await readContract({
        address: CONVEX_BOOSTER_ADDRESS,
        abi,
        functionName: "poolLength",
        chainId: 1337,
        args: []
    }) as BigNumber

    const poolInfo = await readContracts({
        contracts: Array(poolLength.toNumber()).fill(undefined).map((item, idx) => {
            return {
                address: CONVEX_BOOSTER_ADDRESS,
                abi,
                functionName: "poolInfo",
                chainId: 1337,
                args: [idx]
            }
        })
    }) as string[][]

    return poolInfo.map(item => item[0]);
}

const abi = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "poolInfo",
        "outputs": [
            {
                "internalType": "address",
                "name": "lptoken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "gauge",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "crvRewards",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "stash",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "shutdown",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "poolLength",
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