import { Address, getAddress } from "viem";
import { ChainToAddress, ProtocolName, Yield } from "src/yieldOptions/types.js";
import { Clients, IProtocol } from "./index.js";
import { LENDING_POOL_ABI } from "./abi/aave_v3_lending_pool.js";

const LENDING_POOL: ChainToAddress = {
    1: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
    10: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    42161: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    137: "0x794a61358D6845594F94dc1DB02A252b5b4814aD"
};

export class AaveV3 implements IProtocol {
    private clients: Clients;
    constructor(clients: Clients) {
        this.clients = clients;
    }

    key(): ProtocolName {
        return "aaveV3";
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
        const apy = Number(reserveData[2]) / 1e25;

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
            return assets.map(asset => getAddress(asset));
        } catch (e) {
            console.error(e);
            return [];
        }
    }
}