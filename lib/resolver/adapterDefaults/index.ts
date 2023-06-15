
import {
  initDefault,
  beefy,
  convex,
  velodrome,
  flux,
  yearn,
  origin,
  idle,
  compoundV3,
  aura,
  stargate,
  ellipsis,
  alpacaV1
  alpacaV2
} from "./resolver";

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
  alpacaV1,
  alpacaV2,
  ellipsis,
  aura,
  stargate,
  default: initDefault
};

export default AdapterDefaultResolvers;