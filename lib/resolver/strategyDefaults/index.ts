
import {
  curveStargateCompounder,
} from "./resolver";

export type StrategyDefaultResolver = (
  chainId: number,
  address: string
) => Promise<any>;

export type StrategyDefaultResolvers = typeof StrategyDefaultResolvers;

export const StrategyDefaultResolvers: { [key: string]: ({ chainId, address }: { chainId: number, address: string }) => Promise<any[]> } = {
  curveStargateCompounder,
};

export default StrategyDefaultResolvers;