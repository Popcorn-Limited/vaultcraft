import { Address, PublicClient, getAddress } from "viem";
import { ProtocolName, Yield } from "src/yieldOptions/index.js";

export interface IProtocol {
    key(): ProtocolName;
    getAssets(chainId: number): Promise<Address[]>;
    getApy(chainId: number, asset: Address): Promise<Yield>;
}

export type Clients = {
    [chainId: number]: PublicClient;
};

export function getEmptyYield(asset: Address): Yield {
    return {
        total: 0,
        apy: [{
            rewardToken: getAddress(asset),
            apy: 0,
        }]
    };
}

export { AaveV2 } from "./aavev2.js";
export { AaveV3 } from "./aavev3.js";
export { Aura } from "./aura.js";
export { Balancer } from "./balancer.js";
export { Beefy } from "./beefy.js";
export { CompoundV2 } from "./compoundv2.js";
export { CompoundV3 } from "./compoundv3.js";
export { Convex } from "./convex.js";
export { Curve } from "./curve.js";
export { Flux } from "./flux.js";
export { IdleJunior, IdleSenior } from "./idle.js";
export { Origin } from "./origin.js";
export { Stargate } from "./stargate.js";
export { Yearn } from "./yearn.js";
export { YearnFactory } from "./yearnFactory.js";
export { Pirex } from "./pirex.js";
export { Sommelier } from "./sommelier.js"
export { Velodrome } from "./velodrome.js"
export { Stader } from "./stader.js"
export { KelpDao } from "./kelpDao.js"