import { Address, PublicClient } from "viem";
import {
  alpacaV1,
  alpacaV2,
  aura,
  auraCompounder,
  balancer,
  balancerLpCompounder,
  beefy,
  compoundV2,
  compoundV3,
  convex,
  convexCompounder,
  curve,
  curveCompounder,
  curveStargateCompounder,
  initDefault,
  ellipsis,
  flux,
  gearbox,
  idle,
  origin,
  stargate,
  velodrome,
  yearn,
  yearnFactory,
} from "./resolver";

export type StrategyDefaultResolverParams = {
  chainId: number;
  client: PublicClient;
  address: Address;
};

export type StrategyDefaultResolvers = typeof StrategyDefaultResolvers;

export const StrategyDefaultResolvers: {
  [key: string]: ({
    chainId,
    client,
    address,
  }: StrategyDefaultResolverParams) => Promise<any[]>;
} = {
  alpacaV1,
  alpacaV2,
  aura,
  auraCompounder,
  balancer,
  balancerLpCompounder,
  beefy,
  compoundV2,
  compoundV3,
  convex,
  convexCompounder,
  curve,
  curveCompounder,
  curveStargateCompounder,
  ellipsis,
  flux,
  gearbox,
  idle,
  origin,
  stargate,
  velodrome,
  yearn,
  yearnFactory,
  default: initDefault,
};

export default StrategyDefaultResolvers;
