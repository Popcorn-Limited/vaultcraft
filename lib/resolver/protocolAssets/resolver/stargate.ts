import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";
import { BigNumber } from "ethers";

const STARGATE_ADDRESS = { 1: "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b", 42161: "0xeA8DfEE1898a7e0a59f7527F076106d7e44c2176" }

export async function stargate({ chainId }: { chainId: number }): Promise<string[]> {
    const poolLength = await readContract({
        // @ts-ignore
        address: STARGATE_ADDRESS[chainId],
        abi,
        functionName: "poolLength",
        chainId,
        args: []
    }) as BigNumber

    const tokens = await readContracts({
        contracts: Array(poolLength.toNumber()).fill(undefined).map((item, idx) => {
            return {
                // @ts-ignore
                address: STARGATE_ADDRESS[chainId],
                abi,
                functionName: "poolInfo",
                chainId,
                args: [idx]
            }
        })
    }) as string[][]
    
    return tokens.map(item => item?.[0]).filter(item => Boolean(item)) ?? []
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
                "internalType": "contract IERC20",
                "name": "lpToken",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "allocPoint",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lastRewardBlock",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "accStargatePerShare",
                "type": "uint256"
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