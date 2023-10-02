
import { Address } from "viem";
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
} from "./resolver";
import { PublicClient } from "wagmi";

export type StrategyDefaultResolverParams = {
  chainId: number,
  client: PublicClient,
  address: Address
}

export type StrategyDefaultResolvers = typeof StrategyDefaultResolvers;

export const StrategyDefaultResolvers: { [key: string]: ({ chainId, client, address }: StrategyDefaultResolverParams) => Promise<any[]> } = {
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
};

export default StrategyDefaultResolvers;