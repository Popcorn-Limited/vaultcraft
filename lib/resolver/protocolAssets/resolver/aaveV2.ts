import { readContract } from "@wagmi/core";

const POOL_ADDRESS = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";

export async function aaveV2 ({ chainId }: { chainId: number }) {
    return await readContract({
        address: POOL_ADDRESS,
        abi,
        functionName: "getReservesList",
        chainId,
        args: []
    }) as string[];
}

const abi= [
    {
        "inputs": [],
        "name": "getReservesList",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
]