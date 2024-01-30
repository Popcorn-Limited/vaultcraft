import { ProtocolName, Yield } from "src/yieldOptions/types.js";
import { networkNames } from "@/lib/constants/index.js";
import { getEmptyYield, IProtocol } from "./index.js";
import { Address, getAddress } from "viem";
import NodeCache from "node-cache";
import axios from "axios";
import https from "https";

interface BeefyVault {
    id: string;
    status: "active" | "eol";
    network: string;
    tokenAddress: Address;
}

interface ApyBreakdown {
    [key: string]: VaultApy;
}

interface VaultApy {
    totalApy: number;
}

export class Beefy implements IProtocol {
    private cache: NodeCache;

    constructor(ttl: number) {
        this.cache = new NodeCache({ stdTTL: ttl });
    }

    key(): ProtocolName {
        return "beefy";
    }

    async getApy(chainId: number, asset: Address): Promise<Yield> {
        let vaults = await this.getActiveVaults();

        const apy = await this.getApys();

        vaults = vaults.filter((vault) =>
            vault.network === networkNames[chainId].toLowerCase()
        );
        // there are cases where tokenAddress is undefined.
        const beefyVaultObj = vaults.find(vault => vault.tokenAddress && getAddress(vault.tokenAddress) === getAddress(asset));

        return !beefyVaultObj ? getEmptyYield(asset) : {
            total: apy[beefyVaultObj.id].totalApy * 100,
            apy: [{
                rewardToken: getAddress(asset),
                apy: apy[beefyVaultObj.id].totalApy * 100
            }]
        };
    }

    async getAssets(chainId: number): Promise<Address[]> {
        let vaults = await this.getActiveVaults();
        vaults = vaults.filter((vault) =>
            vault.network === networkNames[chainId].toLowerCase()
        );
        // there are cases where tokenAddress is undefined. We have to filter those out
        return vaults.filter((vault) => vault.tokenAddress).map((vault) => getAddress(vault.tokenAddress));
    };

    private async getActiveVaults(): Promise<BeefyVault[]> {
        let vaults = this.cache.get("vaults") as BeefyVault[];
        if (!vaults) {
            vaults = (await axios.get("https://api.beefy.finance/vaults", { timeout: 30000, httpsAgent: new https.Agent({ keepAlive: true }) })).data;
            vaults = vaults.filter((vault) => vault.status === "active");
            this.cache.set("vaults", vaults);
        }
        return vaults;
    }

    private async getApys(): Promise<ApyBreakdown> {
        let apy = this.cache.get("apy") as ApyBreakdown;
        if (!apy) {
            apy = (await axios("https://api.beefy.finance/apy/breakdown", { timeout: 30000, httpsAgent: new https.Agent({ keepAlive: true }) })).data;
            this.cache.set("apy", apy);
        }
        return apy;
    }
}