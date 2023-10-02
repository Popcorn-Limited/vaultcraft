import { ADDRESS_ZERO } from "@/lib/constants";
import { Address } from "viem";
import { StrategyDefaultResolverParams } from "..";

const STAKING_ADDRESS: Address = "0x5B74C99AA2356B4eAa7B85dC486843eDff8Dfdbe";

export async function ellipsis({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
    

    const poolLength = await client.readContract({
        address: STAKING_ADDRESS,
        abi: abiStaking,
        functionName: "poolLength"
    })

    const registeredTokensRes = await client.multicall({
        contracts: Array(Number(poolLength)).fill(undefined).map((item, idx) => {
            return {
                address: STAKING_ADDRESS,
                abi: abiStaking,
                functionName: "registeredTokens",
                args: [idx]
            }
        })
    })
    const registeredTokens: Address[] = registeredTokensRes.filter(token => token.status === "success").map((token: any) => token.result)

    const assetIdx = registeredTokens.findIndex(item => item.toLowerCase() === address.toLowerCase())

    return [assetIdx !== -1 ? assetIdx : ADDRESS_ZERO]; // TODO this should be a number we can clearly distinguish as wrong --> maybe undefined?
}

const abiStaking = [
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
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "registeredTokens",
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
] as const