import axios from "axios";
import NodeCache from "node-cache";
import { Address, getAddress } from "viem";
import { ChainToAddress, ProtocolName, Yield } from "src/yieldOptions/types.js";
import { IProtocol, getEmptyYield } from "./index.js";
import { networkNames } from "@/lib/constants/index.js";

export const CRV: ChainToAddress = {
    1: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    10: "0x0994206dfe8de6ec6920ff4d779b0d950605fb53",
    137: "0x172370d5cd63279efa6d502dab29171933a610af",
    250: "0x1E4F97b9f9F913c46F1632781732927B9019C68b",
    42161: "0x11cdb42b0eb46d95f990bedd4695a6e3fa034978",
};

type PoolData = {
    lpTokenAddress: Address;
    gaugeAddress: Address;
    gaugeCrvApy: number[];
};

export class Curve implements IProtocol {
    private cache: NodeCache;
    constructor(ttl: number) {
        this.cache = new NodeCache({ stdTTL: ttl });
    }

    key(): ProtocolName {
        return "curve";
    }

    async getApy(chainId: number, asset: Address): Promise<Yield> {
        const poolData = await this.getPoolData(chainId);

        const pool = poolData.find(pool => getAddress(pool.lpTokenAddress) === getAddress(asset));
        if (!pool) return getEmptyYield(asset);
        // TODO: there are quite a number of pools that have `null` or no gauge reward data at all.
        // This covers all such cases. It sets the apy to 0 for all of them. Ideally we'd filter those out
        const apy = pool.gaugeCrvApy?.length > 0 ? pool.gaugeCrvApy[0] || 0 : 0;
        return {
            total: apy,
            apy: [{
                rewardToken: getAddress(CRV[chainId]),
                apy: apy,
            }]
        };

    }

    async getAssets(chainId: number): Promise<Address[]> {
        const poolData = await this.getPoolData(chainId);
        if (!poolData) return [];

        return poolData.filter(pool => pool.gaugeAddress).map(pool => getAddress(pool.lpTokenAddress));
    };

    private async getPoolData(chainId: number): Promise<PoolData[]> {
        if (!Object.keys(CRV).includes(String(chainId))) throw new Error(`chain ${chainId} not supported`);
        const network = networkNames[chainId].toLowerCase();

        // if one hour has passed since we last called the Curve API, we'll refresh the cache data.
        let poolData = this.cache.get(`poolData_${network}`) as PoolData[];
        if (!poolData) {
            const main = axios.get(`https://api.curve.fi/api/getPools/${network}/main`);
            const crypto = axios.get(`https://api.curve.fi/api/getPools/${network}/crypto`);
            const factory = axios.get(`https://api.curve.fi/api/getPools/${network}/factory`);
            const factoryCrypto = axios.get(`https://api.curve.fi/api/getPools/${network}/factory-crypto`);
            const factoryCrvusd = axios.get(`https://api.curve.fi/api/getPools/${network}/factory-crvusd`);
            const factoryTtricrypto = axios.get(`https://api.curve.fi/api/getPools/${network}/factory-tricrypto`);

            const responses = await Promise.all([main, crypto, factory, factoryCrypto, factoryCrvusd, factoryTtricrypto]);
            const pools = responses.map((resp) => resp.data);
            poolData = pools.map((pool) => pool.data.poolData).flat();
            this.cache.set(`poolData_${network}`, poolData);
        }
        return poolData;
    }
}