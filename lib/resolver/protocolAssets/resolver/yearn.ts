import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";
import { BigNumber } from "ethers";
import { mainnet } from "wagmi/chains";

const VAULT_REGISTRY_ADDRESS = { 1: "0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804", 42161: "0x3199437193625DCcD6F9C9e98BDf93582200Eb1f" };
const VAULT_FACTORY_ADDRESS = "0x21b1FC8A52f179757bf555346130bF27c0C2A17A";

export async function yearn({ chainId }: { chainId: number }): Promise<string[]> {
    const numTokens = await readContract({
        // @ts-ignore
        address: VAULT_REGISTRY_ADDRESS[chainId],
        abi: abiRegistry,
        functionName: "numTokens",
        chainId,
        args: []
    }) as BigNumber

    const registryTokens = await readContracts({
        contracts: Array(numTokens.toNumber()).fill(undefined).map((item, idx) => {
            return {
                // @ts-ignore
                address: VAULT_REGISTRY_ADDRESS[chainId],
                abi: abiRegistry,
                functionName: "tokens",
                chainId,
                args: [idx]
            }
        })
    }) as string[]

    let factoryTokens: string[] = []
    if (chainId === mainnet.id) {
        const allDeployedVaults = await readContract({
            address: VAULT_FACTORY_ADDRESS,
            abi: abiFactory,
            functionName: "allDeployedVaults",
            chainId,
            args: []
        }) as `0x${string}`[]

        factoryTokens = await readContracts({
            contracts: allDeployedVaults.map(item => {
                return {
                    address: item,
                    abi: abiVault,
                    functionName: "token",
                    chainId,
                    args: []
                }
            })
        }) as string[]
    }

    return [...registryTokens, ...factoryTokens].filter((item, idx, arr) => arr.indexOf(item) === idx)
}



const abiRegistry = [
    {
        "stateMutability": "view",
        "type": "function",
        "name": "tokens",
        "inputs": [
            {
                "name": "arg0",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "numTokens",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
];
const abiFactory = [
    {
        "inputs": [],
        "name": "allDeployedVaults",
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
];
const abiVault = [
    {
        "stateMutability": "view",
        "type": "function",
        "name": "token",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ]
    },
];