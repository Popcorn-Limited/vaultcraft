import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";
import { BigNumber, constants } from "ethers";

const STAKING_ADDRESS = "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b";

export async function stargate({ chainId, address }: { chainId: number, address: string }) {
    const poolLength = await readContract({
        address: STAKING_ADDRESS,
        abi,
        functionName: "poolLength",
        chainId,
        args: []
    }) as BigNumber

    const tokens = await readContracts({
        contracts: Array(poolLength.toNumber()).fill(undefined).map((item, idx) => {
            return {
                address: STAKING_ADDRESS,
                abi,
                functionName: "poolInfo",
                chainId,
                args: [idx]
            }
        })
    }) as Array<{
        lpToken: string,
    }>

    const lpTokens = tokens.map(item => item.lpToken.toLowerCase())

    return [
        lpTokens.includes(address.toLowerCase())
          ? lpTokens.indexOf(address.toLowerCase())
          : constants.AddressZero
    ]
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