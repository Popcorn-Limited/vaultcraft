import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";
import { BigNumber } from "ethers";

const VAULT_REGISTRY_ADDRESS = "0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804";
const VAULT_FACTORY_ADDRESS = "0x21b1FC8A52f179757bf555346130bF27c0C2A17A";

export async function yearn({ chainId }: { chainId: number }): Promise<string[]> {
    const numTokens = await readContract({
        address: VAULT_REGISTRY_ADDRESS,
        abi: abiRegistry,
        functionName: "numTokens",
        chainId: 1337,
        args: []
    }) as BigNumber

    const registryTokens = await readContracts({
        contracts: Array(numTokens.toNumber()).fill(undefined).map((item, idx) => {
            return {
                address: VAULT_REGISTRY_ADDRESS,
                abi: abiRegistry,
                functionName: "tokens",
                chainId: 1337,
                args: [idx]
            }
        })
    }) as string[]

    const allDeployedVaults = await readContract({
        address: VAULT_FACTORY_ADDRESS,
        abi: abiFactory,
        functionName: "allDeployedVaults",
        chainId: 1337,
        args: []
    }) as `0x${string}`[]

    const factoryTokens = await readContracts({
        contracts: allDeployedVaults.map(item => {
            return {
                address: item,
                abi: abiVault,
                functionName: "token",
                chainId: 1337,
                args: []
            }
        })
    }) as string[]

    const tokens = [...registryTokens, ...factoryTokens]

    return tokens.filter((item, idx, arr) => arr.indexOf(item) === idx)
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