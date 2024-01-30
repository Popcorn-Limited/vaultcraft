import { ChainToAddress, ProtocolName, Yield } from "src/yieldOptions/types.js";
import { Clients, IProtocol, getEmptyYield } from "./index.js";
import { Address, getAddress } from "viem";
import NodeCache from "node-cache";
import axios from "axios";
import https from "https";

const VAULT_FACTORY_ADDRESS: ChainToAddress = { 1: "0x21b1FC8A52f179757bf555346130bF27c0C2A17A" };

type Vault = {
    token: {
        address: Address;
    },
    apy: {
        net_apy: number;
    };
}

export class YearnFactory implements IProtocol {
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
                axios.get(`https://api.yexporter.io/v1/chains/${chainId}/vaults/all`,
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
        if (chainId !== 1) throw new Error("YearnFactory is only supported on Ethereum mainnet");
        let assets = this.cache.get("assets") as Address[];
        if (assets) {
            return assets;
        }

        const client = this.clients[chainId];

        let factoryTokens: Address[] = [];
        const allDeployedVaults = await client.readContract({
            address: VAULT_FACTORY_ADDRESS[chainId],
            abi: abiFactory,
            functionName: "allDeployedVaults",
        });

        factoryTokens = await Promise.all(allDeployedVaults.map(item =>
            client.readContract({
                address: item,
                abi: abiVault,
                functionName: "token",
            })
        ));
        assets = factoryTokens.filter((item, idx, arr) => arr.indexOf(item) === idx).map(asset => getAddress(asset));
        this.cache.set("assets", assets);
        return assets;
    }
}

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