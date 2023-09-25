import { ADDRESS_ZERO } from "@/lib/constants";
import { Address, getAddress } from "viem";
import { StrategyDefaultResolverParams } from "..";

const STAKING_ADDRESS: Address = "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b";

export async function stargate({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
    const poolLength = await client.readContract({
        address: STAKING_ADDRESS,
        abi,
        functionName: "poolLength",
    }) as BigInt

    const tokenRes = await client.multicall({
        contracts: Array(Number(poolLength)).fill(undefined).map((item, idx) => {
            return {
                address: STAKING_ADDRESS,
                abi,
                functionName: "poolInfo",
                args: [idx]
            }
        })
    })
    const lpTokens: Address[] = tokenRes.filter(token => token.status === "success").map((token: any) => getAddress(token.result[0]))

    return [
        lpTokens.includes(getAddress(address))
            ? lpTokens.indexOf(getAddress(address))
            : ADDRESS_ZERO // TODO this should be a number we can clearly distinguish as wrong --> maybe undefined?
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
] as const