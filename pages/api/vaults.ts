import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { createPublicClient, http, type Address, type PublicClient } from "viem";
import { ERC20Abi, VaultAbi } from "@/lib/constants/abi";

type Vault = {
    address: Address;
    gauge: Address;
    assetAddress: Address;
    strategies: Address[];
    chainId: number;
    fees: {
        deposit: BigInt;
        withdrawal: BigInt;
        management: BigInt;
        performance: BigInt;
    };
    type: string;
    description: string;
    creator: Address;
    feeRecipeint: Address;
    baseApy?: number;
    gaugeLowerApr?: number;
    gaugeUpperApr?: number;
};

type Vaults = {
    [address: Address]: Vault;
};

type Strategy = {
    address: Address;
    asset: Address;
    name: string;
    description: string;
    apyId: string;
    apySource: "defillama" | "custom";
    resolver: string;
};

type Strategies = {
    [address: Address]: Strategy;
};

type Gauge = {
    address: Address;
    vault: Address;
    lowerAPR: number;
    upperAPR: number;
};

type Gauges = {
    [address: Address]: Gauge;
};

// see https://github.com/Popcorn-Limited/defi-db/tree/main/archive/vaults
const ChainIds = [
    "1",
    "10",
    "137",
    "196",
    "42161",
    "56",
];

/**
 * Returns a list of all the vaults for a given chainId
 * Expects `chainId` query param
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Vaults | { error: String; }>
) {
    if (req.method !== "GET") {
        res.status(405).json({ error: "can only GET vaults" });
    }

    if (!req.query.chainId || !ChainIds.includes(req.query.chainId as string)) {
        res.status(400).json({ error: "invalid chainId" });
    }

    const client = createPublicClient({
        chain: ChainById[Number(req.query.chainId)],
        transport: http(RPC_URLS[Number(req.query.chainId)]),
    });

    const vaults = (await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/${req.query.chainId}.json`
    )).data as Vaults;

    const strategies = (await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/descriptions/strategies/${req.query.chainId}.json`
    )).data as Strategies;

    const defillamaApy = await getDefillamaApy();
    // gauges contains ALL gauges for all chains
    const gauges = (await axios.get(
        "https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/gauge-apy-data.json"
    )).data as Gauges;

    // retrieve APY data for vault
    for (const vault of Object.values(vaults)) {
        vault.baseApy = await getVaultBaseApy(client, strategies, defillamaApy, vault);
        if (vault.gauge) {
            const gauge = gauges[vault.gauge];
            vault.gaugeLowerApr = gauge.lowerAPR;
            vault.gaugeUpperApr = gauge.upperAPR;
        }
    };

    return res
        .status(200)
        .json(vaults);
}

type Pool = {
    chain: string;
    tvlUsd: number;
    apy: number;
    // that's the pool's id
    pool: string;
};

type DefillamaYieldResponse = {
    [id: string]: Pool;
};

async function getVaultBaseApy(client: PublicClient, strategies: Strategies, defillamaApy: DefillamaYieldResponse, vault: Vault): Promise<number> {

    // for vaults with multiple strats we have to compute the overall APY using the token
    // allocation for each strat and the strat's APY.
    if (vault.strategies.length > 1) {
        // Get TotalAssets and TotalSupply
        const taAndTs = await client.multicall({
            contracts: vault.strategies
                .map((address: Address) => {
                    return [
                        {
                            address: address,
                            abi: VaultAbi,
                            functionName: "totalAssets"
                        },
                        {
                            address: address,
                            abi: VaultAbi,
                            functionName: "totalSupply"
                        }];
                })
                .flat(),
            allowFailure: false,
        }) as bigint[];

        const strategyBalances = await client.multicall({
            contracts: vault.strategies.map((address: Address) => {
                return {
                    address,
                    abi: ERC20Abi,
                    functionName: "balanceOf",
                    args: [vault.address],
                };
            }).flat(),
            allowFailure: false,
        }) as bigint[];

        const vaultTotalAssets = await client.readContract({
            address: vault.address,
            abi: VaultAbi,
            functionName: "totalAssets",
        });


        let apy = 0;
        let n = 0;
        vault.strategies.forEach((strat, i) => {
            if (i > 0) i = i * 2;
            const strategy = strategies[strat];
            if (strategy.apySource !== "defillama") {
                return;
            }

            const stratApy = defillamaApy[strategy.apyId].apy;
            console.log(stratApy);
            const totalAssets = Number(taAndTs[i]);
            const totalSupply = Number(taAndTs[i + 1]);
            const assetsPerShare = totalSupply > 0 ? (totalAssets + 1) / (totalSupply + 1e9) : Number(1e-9);
            const allocationPerc = Number(strategyBalances[n]) * assetsPerShare / Number(vaultTotalAssets);

            apy += stratApy * allocationPerc;
            n++;

        });

        return apy;
    } else {
        const strategy = strategies[vault.strategies[0]];

        // skip apy calc for vaults that use strats that aren't on defillama
        if (strategy.apySource !== "defillama") {
            return 0;
        }


        return defillamaApy[strategy.apyId].apy;
    }
}

async function getDefillamaApy(): Promise<DefillamaYieldResponse> {
    const response: DefillamaYieldResponse = {};
    const { data } = await axios.get(`https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/yields/pools`);

    data.data.forEach((d: Pool) => {
        response[d.pool] = d;
    });

    return response;
}
