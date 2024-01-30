import { Address, getAddress, parseAbi, PublicClient } from "viem";
import { Clients, IProtocol } from "./index.js";
import { ChainToAddress, ProtocolName, Yield } from "src/yieldOptions/types.js";

// @dev Make sure the keys here are correct checksum addresses
const assetToCToken: { [key: number]: { [key: Address]: Address } } = {
    1: {
        // USDC
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
        // WETH
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "0xA17581A9E3356d9A858b789D68B4d866e593aE94",
    },
    137: {
        // USDC
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": "0xF25212E676D1F7F89Cd72fFEe66158f541246445"
    },
    42161: {
        // USDC Bridged
        "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8": "0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA",
        // USDC Native
        "0xaf88d065e77c8cC2239327C5EDb3A432268e5831": "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf",
    },
    8453: {
        // USDC Bridged
        "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA": "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf",
        // WETH
        "0x4200000000000000000000000000000000000006": "0x46e6b214b524310239732D51387075E0e70970bf"
    },
};

// @dev Make sure the keys here are correct checksum addresses
const COMP: ChainToAddress = {
    1: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    42161: "0x354A6dA3fcde098F8389cad84b0182725c6C91dE",
    137: "0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c",
    8453: "0x9e1028F5F1D5eDE59748FFceE5532509976840E0",
};

export class CompoundV3 implements IProtocol {
    private clients: Clients;
    constructor(clients: Clients) {
        if (!clients[1]) {
            throw new Error("CompoundV3 needs access to a mainnet client to pull price data for ETH & COMP");
        }
        this.clients = clients;
    }

    key(): ProtocolName {
        return "compoundV3";
    }

    async getApy(chainId: number, asset: Address): Promise<Yield> {
        const client = this.clients[chainId];
        if (!client) throw new Error(`Missing public client for chain ID: ${chainId}`);

        const cToken = assetToCToken[chainId][asset] as Address;
        if (!cToken) throw new Error(`asset is not available on Compound on chain ${chainId}`);

        const secondsPerDay = 60 * 60 * 24;
        const daysInYear = 365;
        const priceFeedBase = 1e8;
        // If this is too slow at some point, we could run multiple of these requests in parallel

        const baseScale = Number(await this.getBaseScale(client, cToken));
        const utilization = Number(await this.getUtilization(client, cToken));
        const supplyRate = Number(await this.getSupplyRate(client, cToken, BigInt(utilization)));
        const trackingIndexScale = Number(await this.getTrackingIndexScale(client, cToken));
        // see https://github.com/compound-developers/compound-3-developer-faq/blob/61eccdeb3155a53e180bb5689d2afb4c1f36908f/examples/get-apr-example.js#L69
        const supplyApr = supplyRate * secondsPerDay * daysInYear * 100 / 1e18;

        const totalSupply = Number(await this.getTotalSupply(client, cToken));
        const baseTokenPriceFeed = await this.getBaseTokenPriceFeed(client, cToken);
        const baseTokenPriceInUsd = Number(await this.getPrice(client, cToken, baseTokenPriceFeed));
        const compPriceInUsd = Number(await this.getCompPrice());
        const baseTrackingSupplySpeed = Number(await this.getBaseTrackingSupplySpeed(client, cToken));

        const compToSuppliersPerDayInUsd = compPriceInUsd * baseTrackingSupplySpeed * secondsPerDay / trackingIndexScale / priceFeedBase;
        const totalSupplyInUsd = totalSupply * baseTokenPriceInUsd / baseScale / priceFeedBase;
        // see https://github.com/compound-developers/compound-3-developer-faq/blob/61eccdeb3155a53e180bb5689d2afb4c1f36908f/examples/get-apr-example.js#L84
        const supplyCompRewardApr = compToSuppliersPerDayInUsd * daysInYear * 100 / totalSupplyInUsd;

        const result: Yield = {
            total: Number(supplyApr + supplyCompRewardApr),
            apy: [
                {
                    rewardToken: getAddress(asset),
                    apy: Number(supplyApr),
                },
                {
                    rewardToken: getAddress(COMP[chainId]),
                    apy: Number(supplyCompRewardApr),
                }
            ]

        };
        return result;
    }

    getAssets(chainId: number): Promise<Address[]> {
        return Promise.resolve(Object.keys(assetToCToken[chainId]).map((key) => getAddress(key)));
    }


    private getBaseScale(client: PublicClient, cToken: Address): Promise<bigint> {
        return client.readContract({
            address: cToken,
            abi: CTOKEN_ABI,
            functionName: "baseScale",
        });
    }

    private getUtilization(client: PublicClient, cToken: Address): Promise<bigint> {
        return client.readContract({
            address: cToken,
            abi: CTOKEN_ABI,
            functionName: "getUtilization",
        });
    }
    private getSupplyRate(client: PublicClient, cToken: Address, utilization: bigint): Promise<bigint> {
        return client.readContract({
            address: cToken,
            abi: CTOKEN_ABI,
            functionName: "getSupplyRate",
            args: [utilization],
        });
    }
    private getTotalSupply(client: PublicClient, cToken: Address): Promise<bigint> {
        return client.readContract({
            address: cToken,
            abi: CTOKEN_ABI,
            functionName: "totalSupply",
        });
    }
    private getBaseTrackingSupplySpeed(client: PublicClient, cToken: Address): Promise<bigint> {
        return client.readContract({
            address: cToken,
            abi: CTOKEN_ABI,
            functionName: "baseTrackingSupplySpeed",
        });
    }

    private getBaseTokenPriceFeed(client: PublicClient, cToken: Address): Promise<Address> {
        return client.readContract({
            address: cToken,
            abi: CTOKEN_ABI,
            functionName: "baseTokenPriceFeed",
        });
    }
    private getPrice(client: PublicClient, cToken: Address, priceFeed: Address): Promise<bigint> {
        // baseTokenPriceFeed for cWETH on mainnet is a constant price oracle which just returns 1e6.
        // So we need to use the Chainlink WETH/USD oracle here
        if (cToken === "0xA17581A9E3356d9A858b789D68B4d866e593aE94") {
            return this.getEthPrice();
        }
        return client.readContract({
            address: cToken,
            abi: CTOKEN_ABI,
            functionName: "getPrice",
            args: [priceFeed],
        });
    }

    private getTrackingIndexScale(client: PublicClient, cToken: Address): Promise<bigint> {
        return client.readContract({
            address: cToken,
            abi: CTOKEN_ABI,
            functionName: "trackingIndexScale"
        });
    }

    private async getCompPrice(): Promise<bigint> {
        const [, price, , ,] = await this.clients[1].readContract({
            address: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
            abi: parseAbi([
                "function latestRoundData() view returns (uint80, int, uint, uint, uint80)"
            ]),
            functionName: "latestRoundData"
        });

        return price;
    }

    private async getEthPrice(): Promise<bigint> {
        const [, price, , ,] = await this.clients[1].readContract({
            address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
            abi: parseAbi([
                "function latestRoundData() view returns (uint80, int, uint, uint, uint80)"
            ]),
            functionName: "latestRoundData"
        });

        return price;
    }
}

const CTOKEN_ABI = parseAbi([
    "function getUtilization() view returns (uint)",
    "function getSupplyRate(uint) view returns (uint64)",
    "function totalSupply() view returns (uint)",
    "function baseTrackingSupplySpeed() view returns (uint)",
    "function baseTokenPriceFeed() view returns (address)",
    "function getPrice(address) view returns (uint)",
    "function baseScale() view returns (uint)",
    "function trackingIndexScale() view returns (uint)",
]);