
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
  address: string,
) => Promise<any[]>;

export type StrategyDefaultResolvers = typeof StrategyDefaultResolvers;

export const StrategyDefaultResolvers: { [key: string]: ({ chainId, address }: { chainId: number, address: string }) => Promise<any[]> } = {
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