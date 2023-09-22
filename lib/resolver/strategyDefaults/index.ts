
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

export type StrategyDefaultResolver = (
  chainId: number,
  address: Address,
) => Promise<any[]>;

export type StrategyDefaultResolvers = typeof StrategyDefaultResolvers;

export const StrategyDefaultResolvers: { [key: string]: ({ chainId, address }: { chainId: number, address: Address }) => Promise<any[]> } = {
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