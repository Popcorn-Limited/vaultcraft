import { ProtocolName, Yield } from "src/yieldOptions/types.js";
import { IProtocol, getEmptyYield } from "./index.js";
import { Address, getAddress } from "viem";
import { AuraPool, getAuraPools } from "./aura.js";
import axios from "axios";
import NodeCache from "node-cache";


export class Balancer implements IProtocol {
    private cache: NodeCache;

    constructor(ttl: number) {
        this.cache = new NodeCache({ stdTTL: ttl });
    }

    key(): ProtocolName {
        return "balancer";
    }

    async getApy(chainId: number, asset: Address): Promise<Yield> {
        // we can get apy data for balancer through the aura subgraph
        const pools = await this.getAuraPoolData(chainId);
        const pool = pools.find(pool => getAddress(pool.lpToken.address) === getAddress(asset));

        if (!pool) {
            return getEmptyYield(asset);
        }
        const result: Yield = {
            total: 0,
            apy: [],
        };

        pool.aprs.breakdown.forEach((apr) => {
            if (!apr.value || apr.value <= 0) {
                // we don't care about rewards with 0 yield
                return;
            }
            if (apr.id.includes("AURA")) {
                // we don't care about any AURA rewards
                return;
            }

            result.total += apr.value;
            result.apy!.push({
                rewardToken: getAddress(apr.token?.address || asset),
                apy: apr.value,
            });
        });
        return result;
    }

    async getAssets(chainId: number): Promise<Address[]> {
        const gauges = await this.getBalancerGauges(chainId);
        return gauges.map((gauge) => getAddress(gauge.lpToken));
    }

    private async getBalancerGauges(chainId: number): Promise<Gauge[]> {
        // each chain (Mainnet, Arbitrum, Polygon) has their own subgraph:
        // https://docs.balancer.fi/reference/vebal-and-gauges/gauges.html#query-pending-tokens-for-a-given-pool
        const res = await axios.post("https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges", {
            headers: {
                'Content-Type': 'application/json',
            },
            query: `
            {
                liquidityGauges(
                    where:{
                    isKilled: false,
                    }
                ) {
                    id,
                    poolAddress,
                }
            }
          `,
        });

        return res.data.data.liquidityGauges.map((gauge: { id: Address; poolAddress: Address; }) => {
            return {
                address: getAddress(gauge.id),
                lpToken: getAddress(gauge.poolAddress),
            } as Gauge;
        });
    }

    private async getAuraPoolData(chainId: number): Promise<AuraPool[]> {
        let pools = this.cache.get("balancer-pools") as AuraPool[];
        if (!pools) {
            pools = await getAuraPools(chainId);
            this.cache.set("balancer-pools", pools);
        }
        return pools;
    }
}

type Gauge = {
    address: Address;
    lpToken: Address;
};

