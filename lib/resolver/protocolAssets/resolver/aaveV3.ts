import { readContract } from "@wagmi/core";

const POOL_ADDRESS = { 1: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", 42161: "0x794a61358D6845594F94dc1DB02A252b5b4814aD" };

export async function aaveV3({ chainId }: { chainId: number }) {
    return await readContract({
        // @ts-ignore
        address: POOL_ADDRESS[chainId],
        abi,
        functionName: "getReservesList",
        chainId,
        args: []
    }) as string[]

}

const abi = [
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
