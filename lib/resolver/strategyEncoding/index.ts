
import { Address } from "viem";
import {
  balancerLpCompounder,
  curveCompounder,
  curveStargateCompounder

} from "./resolver";
import { PublicClient } from "wagmi";

export type StrategyEncodingResolverParams = {
  chainId: number,
  client: PublicClient,
  address: Address,
  params: any[]
}

export type StrategyEncodingResolvers = typeof StrategyEncodingResolvers;

export const StrategyEncodingResolvers: { [key: string]: ({ chainId, client, address, params }: StrategyEncodingResolverParams) => Promise<string> } = {
  balancerLpCompounder,
  curveCompounder,
  curveStargateCompounder,
  convexCompounder: curveCompounder,
  auraCompounder: balancerLpCompounder
};

export default StrategyEncodingResolvers;