import NodeCache from "node-cache";
import type { ChainToAddress, ProtocolName, Yield } from "src/yieldOptions/types.js";
import { Address, getAddress } from "viem";
import { IProtocol, getEmptyYield } from "./index.js";
import { CRV } from "./curve.js";
import getConvexPools, { ConvexPool } from "@/lib/external/convex/getConvexPools.js";

// @dev Make sure the addresses here are correct checksum addresses
const CVX: ChainToAddress = { 1: "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B" }

export class Convex implements IProtocol {
    private cache: NodeCache;
    constructor(ttl: number) {
        this.cache = new NodeCache({ stdTTL: ttl });
    }

    key(): ProtocolName {
        return "convex";
    }

    async getApy(chainId: number, asset: Address): Promise<Yield> {
        if (chainId !== 1) {
            throw new Error("Convex is only supported on Ethereum mainnet");
        }
        const pool = (await this.getConvexPools()).find((x) => getAddress(x.lpToken) === asset);
        if (!pool) {
            return getEmptyYield(asset);
        }

        return {
            total: (Number(pool.crvApr) + Number(pool.cvxApr)) * 100,
            apy: [
                {
                    rewardToken: CRV[chainId],
                    apy: Number(pool.crvApr) * 100,
                },
                {
                    rewardToken: CVX[chainId],
                    apy: Number(pool.cvxApr) * 100,
                },
            ],
        };
    }

    async getAssets(chainId: number): Promise<Address[]> {
        if (chainId !== 1) {
            throw new Error("Convex is only supported on Ethereum mainnet");
        }
        const pools = await this.getConvexPools();
        return pools.map((pool) => pool.lpToken);
    }

    private async getConvexPools(): Promise<ConvexPool[]> {
        let pools = this.cache.get("pools") as ConvexPool[];
        if (!pools) {
            pools = await getConvexPools();
            this.cache.set("pools", pools);
        }
        return pools;
    }
}
