import {
  aaveV2,
  aaveV3,
  alpacaV1,
  alpacaV2,
  aura,
  balancer,
  beefy,
  compoundV2,
  compoundV3,
  convex,
  curve,
  assetDefault,
  ellipsis,
  flux,
  gearbox,
  idle,
  origin,
  radiant,
  stargate,
  velodrome,
  yearn,
} from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers: { [key: string]: ({ chainId }: { chainId: number }) => Promise<string[]> } = {
  aaveV2,
  aaveV3,
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
  radiant,
  stargate,
  velodrome,
  yearn,
  default: assetDefault,
};

export default ProtocolAssetResolvers;