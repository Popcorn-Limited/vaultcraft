import { initDefault, beefy, convex, velodrome, flux, yearn, origin, idle, compoundV3, curve } from "./resolver";

export type AdapterDefaultResolver = (
  chainId: number,
  address: string
) => Promise<any>;

export type AdapterDefaultResolvers = typeof AdapterDefaultResolvers;

export const AdapterDefaultResolvers: { [key: string]: ({ chainId, address }: { chainId: number, address: string }) => Promise<any[]> } = {
  beefy,
  convex,
  velodrome,
  flux,
  yearn,
  origin,
  idle,
  compoundV3,
  curve,
  default: initDefault
};

export default AdapterDefaultResolvers;