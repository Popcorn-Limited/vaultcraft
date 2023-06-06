import { readContract } from "@wagmi/core";

const POOL_ADDRESS = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";

export async function aaveV3({ chainId }: { chainId: number }) {
    const reservesList = await readContract({
        address: POOL_ADDRESS,
        abi,
        functionName: "getReservesList",
        chainId: 1337,
        args: []
    }) as string[]

    return reservesList
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
