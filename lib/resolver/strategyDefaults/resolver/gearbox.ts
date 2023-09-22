import { ADDRESS_ZERO } from "@/lib/constants";
import { Address, createPublicClient, http } from "viem";
import { mainnet } from "wagmi";

const REGISTER_ADDRESS = "0xA50d4E7D8946a7c90652339CDBd262c375d54D99";

export async function gearbox({ chainId, address }: { chainId: number, address: Address }): Promise<any[]> {
    // TODO -- temp solution, we should pass the client into the function
    const client = createPublicClient({
        chain: mainnet,
        // @ts-ignore
        transport: http(RPC_URLS[chainId])
    })

    const pools = await client.readContract({
        address: REGISTER_ADDRESS,
        abi: abiRegister,
        functionName: "getPools"
    })

    const tokenRes = await client.multicall({
        contracts: pools.map(pool => ({
            address: pool,
            abi: abiPool,
            functionName: "underlyingToken",
        })),
    })
    const tokens: Address[] = tokenRes.filter(token => token.status === "success").map((token: any) => token.result)

    const assetIdx = tokens.findIndex(token => token.toLowerCase() === address.toLowerCase());

    return [assetIdx !== -1 ? assetIdx : ADDRESS_ZERO]; // TODO this should be a number we can clearly distinguish as wrong --> maybe undefined?
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
] as const;
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
] as const;
