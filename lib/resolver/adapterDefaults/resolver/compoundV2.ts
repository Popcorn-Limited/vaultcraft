import { RPC_URLS } from "@/lib/connectors";
import { ADDRESS_ZERO } from "@/lib/constants";
import { Address, createPublicClient, getAddress, http } from "viem";
import { mainnet } from "wagmi";

const COMPTROLLER_ADDRESS: Address = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";

export async function compoundV2({ chainId, address }: { chainId: number, address: string }) {
    // TODO -- temp solution, we should pass the client into the function
    const client = createPublicClient({
        chain: mainnet,
        // @ts-ignore
        transport: http(RPC_URLS[chainId])
    })

    const cTokens = await client.readContract({
        address: COMPTROLLER_ADDRESS,
        abi: abiComptroller,
        functionName: "getAllMarkets",
    })

    const underlyingRes = await client.multicall({
        contracts: cTokens.map(address => {
            return {
                address,
                abi: abiMarket,
                functionName: "underlying",
            }
        })
    })
    // TODO check response (token.result[0])
    const underlying: Address[] = underlyingRes.filter(token => token.status === "success").map((token: any) => getAddress(token.result[0]))

    return [
        underlying.includes(getAddress(address))
            ? cTokens[underlying.indexOf(getAddress(address))]
            : ADDRESS_ZERO
    ]
}

const abiComptroller = [
    {
        "constant": true,
        "inputs": [],
        "name": "getAllMarkets",
        "outputs": [
            {
                "internalType": "contract CToken[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
] as const;
const abiMarket = [
    {
        "constant": true,
        "inputs": [],
        "name": "underlying",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
] as const;