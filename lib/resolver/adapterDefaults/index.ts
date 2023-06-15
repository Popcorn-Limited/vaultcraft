
import {
  alpacaV1,
  alpacaV2,
  aura,
  balancer,
  beefy,
  compoundV2,
  compoundV3,
  convex,
  curve,
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

export type AdapterDefaultResolver = (
  chainId: number,
  address: string
) => Promise<any>;

export type AdapterDefaultResolvers = typeof AdapterDefaultResolvers;

export const AdapterDefaultResolvers: { [key: string]: ({ chainId, address }: { chainId: number, address: string }) => Promise<any[]> } = {
  alpacaV1,
  alpacaV2,
  aura,
  balancer,
  beefy,
  compoundV2,
  compoundV3,
  convex,
  curve,
  ellipsis,
  flux,
  gearbox,
  idle,
  origin,
  stargate,
  velodrome,
  yearn,
  default: initDefault,
};

export default AdapterDefaultResolvers;