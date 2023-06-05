import { beefy, convex } from "./resolver";

export type AdapterDefaultResolver = (
  chainId: number,
  address: string
) => Promise<any>;

export type AdapterDefaultResolvers = typeof AdapterDefaultResolvers;

export const AdapterDefaultResolvers = {
  beefy,
  convex,
  default: beefy
};

export default AdapterDefaultResolvers;