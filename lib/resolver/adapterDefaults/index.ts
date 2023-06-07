import { beefy, velodrome } from "./resolver";

export type AdapterDefaultResolver = (
  chainId: number,
  address: string
) => Promise<any>;

export type AdapterDefaultResolvers = typeof AdapterDefaultResolvers;

export const AdapterDefaultResolvers = {
  beefy,
  velodrome,
  default: beefy
};

export default AdapterDefaultResolvers;