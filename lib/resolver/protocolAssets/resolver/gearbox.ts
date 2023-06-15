import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";

const REGISTER_ADDRESS = "0xA50d4E7D8946a7c90652339CDBd262c375d54D99";

export async function gearbox({ chainId }: { chainId: number }): Promise<string[]> {
    const pools = await readContract({
        address: REGISTER_ADDRESS,
        abi: abiRegister,
        functionName: "getPools",
        chainId,
        args: [],
    }) as `0x${string}`[]

    const tokens = await readContracts({
        contracts: pools.map(pool => ({
            address: pool,
            abi: abiPool,
            functionName: "underlyingToken",
            chainId,
            args: [],
        })),
    });

    return tokens as string[];
}

const abiRegister = [
    {
        "inputs": [],
        "name": "getPools",
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
const abiPool = [
    {
        "inputs": [],
        "name": "underlyingToken",
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
