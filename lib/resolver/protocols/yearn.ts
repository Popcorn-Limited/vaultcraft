import { ChainToAddress, ProtocolName, Yield } from "src/yieldOptions/types.js";
import { Clients, IProtocol, getEmptyYield } from "./index.js";
import { Address, getAddress } from "viem";
import NodeCache from "node-cache";
import axios from "axios";
import https from "https";

const VAULT_REGISTRY_ADDRESS: ChainToAddress = { 1: "0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804", 42161: "0x3199437193625DCcD6F9C9e98BDf93582200Eb1f" };

type Vault = {
    token: {
        address: Address;
    },
    apy: {
        net_apy: number;
    };
}

export class Yearn implements IProtocol {
    private cache: NodeCache;
    private clients: Clients;
    constructor(clients: Clients, ttl: number) {
        this.clients = clients;
        this.cache = new NodeCache({ stdTTL: ttl });
    }

    key(): ProtocolName {
        return "yearn";
    }

    async getApy(chainId: number, asset: Address): Promise<Yield> {
        let vaults = this.cache.get("vaults") as Vault[];
        if (!vaults) {
            vaults = (await
                axios.get(`https://app.vaultcraft.io/api/yVaults?chainId=${chainId}`,
                    { timeout: 30000, httpsAgent: new https.Agent({ keepAlive: true }) }
                )
            ).data;
            this.cache.set("vaults", vaults);
        }
        const vault = vaults.find((vault: any) => getAddress(vault.token.address) === getAddress(asset));

        return !vault ?
            getEmptyYield(asset) :
            {
                total: vault.apy.net_apy * 100,
                apy: [{
                    rewardToken: getAddress(asset),
                    apy: vault.apy.net_apy * 100
                }]
            };
    }

    async getAssets(chainId: number): Promise<Address[]> {
        const client = this.clients[chainId];
        if (!client) throw new Error(`Missing public client for chain ID: ${chainId}`);
        let assets = this.cache.get("assets") as Address[];
        if (assets) {
            return assets;
        }
        const numTokens = await client.readContract({
            address: VAULT_REGISTRY_ADDRESS[chainId],
            abi: abiRegistry,
            functionName: "numTokens",
        }) as bigint;

        const registryTokens = await Promise.all(Array(Number(numTokens)).fill(undefined).map((_, i) =>
            client.readContract({
                address: VAULT_REGISTRY_ADDRESS[chainId],
                abi: abiRegistry,
                functionName: "tokens",
                args: [BigInt(i)]
            })
        ));

        assets = registryTokens.filter((item, idx, arr) => arr.indexOf(item) === idx).map(asset => getAddress(asset));
        this.cache.set("assets", assets);
        return assets;
    }
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
] as const;
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
] as const;
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
] as const;