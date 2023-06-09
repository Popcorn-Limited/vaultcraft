
import {
  aaveV2,
  aaveV3,
  beefy,
  compoundV2,
  compoundV3,
  curve,
  apyDefault,
  flux,
  idle,
  origin,
  stargate,
  yearn
} from "./resolver";

export type AdapterApyResolver = (
  chainId: number,
  address: string
) => Promise<number>;

export type AdapterApyResolvers = typeof AdapterApyResolvers;

export const AdapterApyResolvers: { [key: string]: ({ chainId, address }: { chainId: number, address: string }) => Promise<number> } = {
  aaveV2,
  aaveV3,
  beefy,
  compoundV2,
  compoundV3,
  curve,
  flux,
  idle,
  origin,
  stargate,
  yearn,
  default: apyDefault
};

export default AdapterApyResolvers;