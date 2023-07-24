
import {
  curveStargateCompounder,
  curveCompounder,
  balancerLpCompounder
} from "./resolver";

export type StrategyDefaultResolver = (
  chainId: number,
  address: string,
  adapter: string
) => Promise<any>;

export type StrategyDefaultResolvers = typeof StrategyDefaultResolvers;

export const StrategyDefaultResolvers: { [key: string]: ({ chainId, address, adapter }: { chainId: number, address: string, adapter: string }) => Promise<any[]> } = {
  curveStargateCompounder,
  curveCompounder,
  balancerLpCompounder
};

export default StrategyDefaultResolvers;