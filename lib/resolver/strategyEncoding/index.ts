
import {
  curveStargateCompounder,
} from "./resolver";

export type StrategyEncodingResolver = (
  chainId: number,
  address: string,
  params: any[],
) => Promise<string>;

export type StrategyEncodingResolvers = typeof StrategyEncodingResolvers;

export const StrategyEncodingResolvers: { [key: string]: ({ chainId, address, params }: { chainId: number, address: string, params: any[] }) => Promise<string> } = {
  curveStargateCompounder,
};

export default StrategyEncodingResolvers;