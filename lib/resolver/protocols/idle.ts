import type { ProtocolName, Yield } from "src/yieldOptions/types.js";
import { Clients, IProtocol, getEmptyYield } from "./index.js";
import { Address, PublicClient, getAddress, parseUnits } from "viem";
import { IDLE_CDO_ABI } from "./abi/idle_cdo.js";
import axios from "axios";
import { tranches } from "@/lib/external/idle/index.js";

const apr2apy = (apr: bigint) => {
    return (1 + (Number(apr) / 1e20) / 365) ** 365 - 1;
};

abstract class IdleAbstract implements IProtocol {
    private clients: Clients;
    constructor(clients: Clients) {
        this.clients = clients;
    }

    key(): ProtocolName {
        return "idleJunior";
    }

    async getApy(chainId: number, asset: Address): Promise<Yield> {
        return getEmptyYield(asset);
    }

    async _getApy(chainId: number, asset: Address, tranche: "junior" | "senior"): Promise<Yield> {
        const client = this.clients[chainId];
        if (!client) throw new Error(`Missing public client for chain ID: ${chainId}`);

        const idleAddresses = tranches[chainId][asset];
        if (!idleAddresses) return getEmptyYield(asset);

        let apr;
        if (getAddress(asset) === "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84") {
            apr = await this._getStEthApy(client, idleAddresses.cdo, tranche === "senior");
        } else {
            apr = await this._getTrancheApr(client, idleAddresses.cdo, idleAddresses[tranche]);
        }

        const apy = apr2apy(apr) * 100;

        return {
            total: apy,
            apy: [{
                rewardToken: getAddress(asset),
                apy: apy
            }]
        };
    }

    private async _getTrancheApr(client: PublicClient, cdo: Address, tranche: Address): Promise<bigint> {
        return client.readContract({
            address: cdo,
            abi: IDLE_CDO_ABI,
            functionName: 'getApr',
            args: [tranche]
        });
    }

    private async _getStEthApy(client: PublicClient, cdo: Address, isBBTranche: boolean): Promise<bigint> {
        const poLidoStats = (await axios.get('https://api.idle.finance/poLidoStats', { headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IkFwcDciLCJpYXQiOjE2NzAyMzc1Mjd9.L12KJEt8fW1Cvy3o7Nl4OJ2wtEjzlObaAYJ9aC_CY6M` } })).data
        const strategyApr = parseUnits(String(poLidoStats.apr), 18);
        const FULL_ALLOC = await client.readContract({
            address: cdo,
            abi: IDLE_CDO_ABI,
            functionName: 'FULL_ALLOC',
        });
        let currentAARatio = await client.readContract({
            address: cdo,
            abi: IDLE_CDO_ABI,
            functionName: 'getCurrentAARatio',
        });
        let trancheAPRSplitRatio = await client.readContract({
            address: cdo,
            abi: IDLE_CDO_ABI,
            functionName: 'trancheAPRSplitRatio',
        });

        if (isBBTranche) {
            trancheAPRSplitRatio = FULL_ALLOC - trancheAPRSplitRatio;
            currentAARatio = FULL_ALLOC - currentAARatio;
        }

        return strategyApr * trancheAPRSplitRatio / currentAARatio;
    }

    async getAssets(chainId: number): Promise<Address[]> {
        const client = this.clients[chainId];
        if (!client) throw new Error(`Missing public client for chain ID: ${chainId}`);

        return Object.keys(tranches[chainId]).map(asset => getAddress(asset));
    };
}

export class IdleJunior extends IdleAbstract {
    key(): ProtocolName {
        return "idleJunior";
    }

    async getApy(chainId: number, asset: Address): Promise<Yield> {
        return super._getApy(chainId, asset, "junior");
    }
}

export class IdleSenior extends IdleAbstract {
    key(): ProtocolName {
        return "idleSenior";
    }

    async getApy(chainId: number, asset: Address): Promise<Yield> {
        return super._getApy(chainId, asset, "senior");
    }
}