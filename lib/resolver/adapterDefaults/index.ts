import { beefy, convex, velodrome, flux } from "./resolver";

export type AdapterDefaultResolver = (
  chainId: number,
  address: string
) => Promise<any>;

export type AdapterDefaultResolvers = typeof AdapterDefaultResolvers;

export const AdapterDefaultResolvers = {
  beefy,
  convex,
  velodrome,
  flux,
  default: beefy
};

export default AdapterDefaultResolvers;