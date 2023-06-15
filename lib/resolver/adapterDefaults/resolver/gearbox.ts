import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";
import { constants } from "ethers";

const REGISTER_ADDRESS = "0xA50d4E7D8946a7c90652339CDBd262c375d54D99";

export async function gearbox({ chainId, address }: { chainId: number, address: string }) {
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
    }) as string[];

    const assetIdx = tokens.findIndex(token => token.toLowerCase() === address.toLowerCase());

    return [ assetIdx !== -1 ? assetIdx : constants.AddressZero ];
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
