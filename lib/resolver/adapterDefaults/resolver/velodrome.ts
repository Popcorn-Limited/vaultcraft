import { readContract } from "@wagmi/core";
import { constants } from "ethers";

const VELODROME_LENSE_ADDRESS = "0x8B70C5E53235AbBd1415957f7110FBFe5d0529d4";

export async function velodrome({ chainId, address }: { chainId: number, address: string }): Promise<any[]> {
    const { gauge, gauge_alive } = await readContract({
        address: VELODROME_LENSE_ADDRESS,
        abi,
        functionName: "byAddress",
        chainId,
        args: [
            address,
            constants.AddressZero
        ]
    }) as {
        gauge: string,
        gauge_alive: boolean
    }

    return gauge_alive && parseInt(gauge, 16) ? [gauge] : [constants.AddressZero];
}

const abi = [
    {
        "stateMutability": "view",
        "type": "function",
        "name": "byAddress",
        "inputs": [
            {
                "name": "_address",
                "type": "address"
            },
            {
                "name": "_account",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "components": [
                    {
                        "name": "pair_address",
                        "type": "address"
                    },
                    {
                        "name": "symbol",
                        "type": "string"
                    },
                    {
                        "name": "decimals",
                        "type": "uint8"
                    },
                    {
                        "name": "stable",
                        "type": "bool"
                    },
                    {
                        "name": "total_supply",
                        "type": "uint256"
                    },
                    {
                        "name": "token0",
                        "type": "address"
                    },
                    {
                        "name": "reserve0",
                        "type": "uint256"
                    },
                    {
                        "name": "claimable0",
                        "type": "uint256"
                    },
                    {
                        "name": "token1",
                        "type": "address"
                    },
                    {
                        "name": "reserve1",
                        "type": "uint256"
                    },
                    {
                        "name": "claimable1",
                        "type": "uint256"
                    },
                    {
                        "name": "gauge",
                        "type": "address"
                    },
                    {
                        "name": "gauge_total_supply",
                        "type": "uint256"
                    },
                    {
                        "name": "gauge_alive",
                        "type": "bool"
                    },
                    {
                        "name": "fee",
                        "type": "address"
                    },
                    {
                        "name": "bribe",
                        "type": "address"
                    },
                    {
                        "name": "wrapped_bribe",
                        "type": "address"
                    },
                    {
                        "name": "emissions",
                        "type": "uint256"
                    },
                    {
                        "name": "emissions_token",
                        "type": "address"
                    },
                    {
                        "name": "account_balance",
                        "type": "uint256"
                    },
                    {
                        "name": "account_earned",
                        "type": "uint256"
                    },
                    {
                        "name": "account_staked",
                        "type": "uint256"
                    }
                ]
            }
        ]
    },
];