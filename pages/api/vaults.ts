import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { ChainById, RPC_URLS, networkMap } from "@/lib/utils/connectors";
import { createPublicClient, getAddress, http, zeroAddress, type Address, type PublicClient } from "viem";
import { ChildGaugeAbi, ERC20Abi, GaugeAbi, VaultAbi } from "@/lib/constants/abi";
import { Strategy, TokenByAddress, VaultDataByAddress } from "@/lib/types";
import getGaugesData from "@/lib/gauges/getGaugeData";
import { fi } from "date-fns/locale";
import { erc20ABI, mainnet } from "wagmi";
import { vaultronAtom } from "@/lib/atoms";

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

type Strategies = {
    [address: Address]: Strategy
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

    const chainId = Number(req.query.chainId)

    const client = createPublicClient({
        chain: ChainById[chainId],
        transport: http(RPC_URLS[chainId]),
    });

    const vaultsRes = (await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/${chainId}.json`
    )).data as Vaults;

    let vaults: Vaults = {}
    Object.values(vaultsRes).forEach(vault => {
        if (vault.type !== "single-asset-lock-vault-v1") {
            vaults[vault.address] = vault
        }
    });

    const strategies = (await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/descriptions/strategies/${chainId}.json`
    )).data as Strategies;

    let uniqueStrategies: Address[] = []
    Object.values(vaults).forEach(vault => {
        vault.strategies.forEach(strategy => {
            if (!uniqueStrategies.includes(strategy)) {
                uniqueStrategies.push(strategy)
            }
        })
    })
    const usedStrategies = Object.values(strategies).filter(strategy => uniqueStrategies.includes(strategy.address))

    const strategyApys = await Promise.all(usedStrategies.map(async strategy => {
        if (strategy.apySource === "custom") return { address: strategy.address, apy: 0 }

        const { data } = await axios.get(`https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/yields/chart/${strategy.apyId}`)
        return { address: strategy.address, apy: data.data.pop().apy }
    }))

    const vaultsWithGauge = Object.values(vaults).filter(vault => vault.gauge);

    let addresses: Address[] = Object.values(vaults).map(vault => vault.assetAddress)
    for (const vault of vaultsWithGauge) {
        const rewardLogs = await client.getContractEvents({
            address: vault.gauge,
            abi: chainId === mainnet.id ? GaugeAbi : ChildGaugeAbi,
            eventName: chainId === mainnet.id ? "RewardDistributorUpdated" : "AddReward",
            fromBlock: "earliest",
            toBlock: "latest",
        }) as any[];

        if (rewardLogs.length > 0) {
            rewardLogs.forEach(log => {
                if (!addresses.includes(log.args.reward_token)) {
                    addresses.push(log.args.reward_token)
                }
            })
        }
    }

    const vaultRes = await client.multicall({
        contracts: Object.values(vaults)
            .map((vault: any) => {
                return [
                    {
                        address: vault.address,
                        abi: VaultAbi,
                        functionName: "totalAssets"
                    },
                    {
                        address: vault.address,
                        abi: VaultAbi,
                        functionName: "totalSupply"
                    },
                ]
            })
            .flat(),
        allowFailure: false,
    }) as any[];

    const decimalsRes = await client.multicall({
        contracts: addresses
            .map((token: any) => {
                return [
                    {
                        address: token,
                        abi: erc20ABI,
                        functionName: "decimals"
                    },
                ]
            })
            .flat(),
        allowFailure: false,
    });

    const { data: priceData } = await axios.get(
        `https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/coins/prices/current/${String(
            addresses.map(
                (address) => `${networkMap[chainId].toLowerCase()}:${address}`
            )
        )}`
    )

    let tokens: TokenByAddress = {}
    addresses.forEach((address, i) => {
        tokens[address] = {
            address: address,
            name: "",
            symbol: "",
            decimals: Number(decimalsRes[i]),
            logoURI: "",
            balance: 0,
            price: priceData.coins[`${networkMap[chainId].toLowerCase()}:${getAddress(address)}`]?.price || 0,
            totalSupply: 0,
        }
    })

    let vaultsData: VaultDataByAddress = {}
    Object.values(vaults).forEach((vault, i) => {
        if (i > 0) i = i * 2

        const totalAssets = Number(vaultRes[i]);
        const totalSupply = Number(vaultRes[i + 1]);
        const assetsPerShare =
            totalSupply > 0 ? (totalAssets + 1) / (totalSupply + 1e9) : Number(1e-9);


        vaultsData[vault.address] = {
            address: vault.address,
            vault: vault.address,
            asset: vault.assetAddress,
            gauge: getAddress(vault.gauge || zeroAddress),
            chainId: vault.chainId,
            fees: {
                deposit: Number(vault.fees.deposit),
                withdrawal: Number(vault.fees.withdrawal),
                management: Number(vault.fees.management),
                performance: Number(vault.fees.performance)
            },
            totalAssets: totalAssets,
            totalSupply: totalSupply,
            assetsPerShare: assetsPerShare,
            depositLimit: 0,
            tvl: 0,
            apy: 0,
            totalApy: 0,
            apyHist: [],
            apyId: "",
            metadata: {
                type: "single-asset-vault-v1",
                creator: vault.creator,
                feeRecipient: vault.feeRecipeint
            },
            strategies: [],
        }

        tokens[vault.address] = {
            address: vault.address,
            name: "",
            symbol: "",
            decimals: tokens[vault.assetAddress].decimals + 9,
            logoURI: "",
            balance: 0,
            price: (assetsPerShare * tokens[vault.assetAddress].price) * 1e9,
            totalSupply: 0,
        }
    })

    // Get gaugesData for gauge and reward apy
    const gaugesData = await getGaugesData({
        vaultsData,
        tokens: tokens,
        account: zeroAddress,
        chainId: chainId
    })

    // retrieve and add apy data for vault
    for (const vault of Object.values(vaults)) {
        vault.baseApy = await getVaultBaseApy(vault, vaultsData[vault.address].totalAssets, strategyApys, client);

        const gaugeData = gaugesData.find(data => data.vault === vault.address)
        if (gaugeData) {
            vault.gaugeLowerApr = gaugeData.lowerAPR + gaugeData.rewardApy.apy;
            vault.gaugeUpperApr = gaugeData.upperAPR + gaugeData.rewardApy.apy;
        }
    }

    return res
        .status(200)
        .json(vaults);
}

async function getVaultBaseApy(vault: Vault, vaultTotalAssets: number, strategies: any[], client: PublicClient): Promise<number> {

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

        let apy = 0;
        let n = 0;

        vault.strategies.forEach((strat, i) => {
            if (i > 0) i = i * 2;
            const strategy = strategies.find(s => s.address === strat);

            if (!strategy) {
                return;
            } else {
                const stratApy = strategy.apy;
                const totalAssets = Number(taAndTs[i]);
                const totalSupply = Number(taAndTs[i + 1]);
                const assetsPerShare = totalSupply > 0 ? (totalAssets + 1) / (totalSupply + 1e9) : Number(1e-9);
                const allocationPerc = Number(strategyBalances[n]) * assetsPerShare / vaultTotalAssets;

                apy += stratApy * allocationPerc;
                n++;
            }
        });

        return apy;
    } else {
        const strategy = strategies.find(s => s.address === vault.strategies[0]);

        // skip apy calc for vaults that use strats that aren't on defillama
        if (!strategy) {
            return 0;
        }


        return strategy.apy
    }
}