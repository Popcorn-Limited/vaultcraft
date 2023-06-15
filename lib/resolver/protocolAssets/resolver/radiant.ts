import { readContract } from "@wagmi/core";

const LENDING_POOL_ADDRESS = "0xF4B1486DD74D07706052A33d31d7c0AAFD0659E1";

export async function radiant({ chainId }: { chainId: number }) {
    const reserves = await readContract({
        address: LENDING_POOL_ADDRESS,
        abi,
        functionName: "getReservesList",
        chainId,
        args: [],
    }) as string[];

    return reserves
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
    }
]