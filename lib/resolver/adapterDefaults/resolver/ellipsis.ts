import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";
import {BigNumber, constants} from "ethers";

const STAKING_ADDRESS = "0x5B74C99AA2356B4eAa7B85dC486843eDff8Dfdbe";

export async function ellipsis({ chainId, address }: { chainId: number, address: string }): Promise<any[]> {
    const poolLength = await readContract({
        address: STAKING_ADDRESS,
        abi: abiStaking,
        functionName: "poolLength",
        chainId,
        args: [],
    }) as BigNumber;

    const registeredTokens = await readContracts({
        contracts: Array(poolLength.toNumber()).fill(undefined).map((item, idx) => {
            return {
                address: STAKING_ADDRESS,
                abi: abiStaking,
                functionName: "registeredTokens",
                chainId,
                args: [idx],
            }
        })
    }) as string[]

    const assetIdx = registeredTokens.findIndex(item => item.toLowerCase() === address.toLowerCase())

    return [ assetIdx !== -1 ? assetIdx : constants.AddressZero ];
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
]