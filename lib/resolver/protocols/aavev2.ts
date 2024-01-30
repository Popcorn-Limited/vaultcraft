import { Address, getAddress } from "viem";
import { ChainToAddress, ProtocolName, Yield } from "src/yieldOptions/types.js";
import { Clients, IProtocol } from "./index.js";
import { LENDING_POOL_ABI } from "./abi/aave_v2_lending_pool.js";
import { DATA_PROVIDER_ABI } from "./abi/aave_v2_data_provider.js";

const LENDING_POOL: ChainToAddress = {
    1: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
};
const DATA_PROVIDER: ChainToAddress = {
    1: "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d",
}

export class AaveV2 implements IProtocol {
    private clients: Clients;
    constructor(clients: Clients) {
        this.clients = clients;
    }
    key(): ProtocolName {
        return "aaveV2";
    }

    async getApy(chainId: number, asset: Address): Promise<Yield> {
        const client = this.clients[chainId];
        if (!client) throw new Error(`Missing public client for chain ID: ${chainId}`);

        const reserveData = await client.readContract({
            address: LENDING_POOL[chainId],
            abi: LENDING_POOL_ABI,
            functionName: 'getReserveData',
            args: [asset]
        });

        // divided by 1e27 * 100 for percent
        const apy = Number(reserveData[3]) / 1e25;

        return {
            total: apy,
            apy: [{
                rewardToken: getAddress(asset),
                apy: apy
            }]
        };
    }

    async getAssets(chainId: number): Promise<Address[]> {
        const client = this.clients[chainId];
        if (!client) throw new Error(`Missing public client for chain ID: ${chainId}`);
        try {
            const assets = await client.readContract({
                address: LENDING_POOL[chainId],
                abi: LENDING_POOL_ABI,
                functionName: "getReservesList",
            }) as Address[]; // viem returns `readonly` type which we don't want
            const configs = await client.multicall({
                contracts: assets.map(address => {
                    return {
                        address: DATA_PROVIDER[chainId],
                        abi: DATA_PROVIDER_ABI,
                        functionName: "getReserveConfigurationData",
                        args: [address]
                    }
                }),
                allowFailure: false
            })
            return assets.filter((asset, i) => !configs[i][9]).map((asset, i) => getAddress(asset));
        } catch (e) {
            console.error(e);
            return [];
        }
    }
}