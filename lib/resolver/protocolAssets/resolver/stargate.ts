import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";
import { BigNumber } from "ethers";

const STARGATE_ADDRESS = "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b"

export async function stargate({ chainId }: { chainId: number }): Promise<string[]> {
    const poolLength = await readContract({
        address: STARGATE_ADDRESS,
        abi,
        functionName: "poolLength",
        chainId: 1337,
        args: []
    }) as BigNumber

    const tokens = await readContracts({
        contracts: Array(poolLength.toNumber()).fill(undefined).map((item, idx) => {
            return {
                address: STARGATE_ADDRESS,
                abi,
                functionName: "poolInfo",
                chainId: 1337,
                args: [idx]
            }
        })
    }) as string [][]

    return tokens.map(item => item[0])
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