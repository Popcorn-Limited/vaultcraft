import { readContract } from "@wagmi/core";

const VIEW_HELPER_ADDRESS = "0x129bBda5087e132983e7c20ae1F761333D40c229";
const BOOSTER_ADDRESS = "0xA57b8d98dAE62B26Ec3bcC4a365338157060B234";

export async function aura({ chainId }: { chainId: number }): Promise<any[]> {
    const pools = await readContract({
        address: VIEW_HELPER_ADDRESS,
        abi,
        functionName: "getPools",
        chainId,
        args: [ BOOSTER_ADDRESS ]
    }) as {
        lptoken: string
    }[];

    return pools.map(pool => pool.lptoken)
}

const abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_booster",
                "type": "address"
            }
        ],
        "name": "getPools",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "pid",
                        "type": "uint256"
                    },
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
                    },
                    {
                        "internalType": "address",
                        "name": "rewardToken",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "poolId",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "normalizedWeights",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "address[]",
                        "name": "poolTokens",
                        "type": "address[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "underlying",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalSupply",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "periodFinish",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "lastUpdateTime",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "rewardRate",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "rewardPerTokenStored",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "queuedRewards",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct AuraViewHelpers.RewardsData",
                        "name": "rewardsData",
                        "type": "tuple"
                    },
                    {
                        "components": [
                            {
                                "internalType": "address",
                                "name": "addr",
                                "type": "address"
                            },
                            {
                                "internalType": "address",
                                "name": "rewardsToken",
                                "type": "address"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint256",
                                        "name": "periodFinish",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "lastUpdateTime",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "rewardRate",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "rewardPerTokenStored",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "queuedRewards",
                                        "type": "uint256"
                                    }
                                ],
                                "internalType": "struct AuraViewHelpers.RewardsData",
                                "name": "rewardsData",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct AuraViewHelpers.ExtraRewards[]",
                        "name": "extraRewards",
                        "type": "tuple[]"
                    }
                ],
                "internalType": "struct AuraViewHelpers.Pool[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
]