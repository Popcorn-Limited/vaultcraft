import {
  assetDefault,
  beefy,
  yearn,
  convex,
  stargate,
  compoundV2,
  compoundV3,
  flux,
  velodrome,
  aaveV2,
  aaveV3,
  origin,
  idle,
  aura,
  alpacaV1,
  alpacaV2,
  ellipsis,
  radiant,
  curve,
  gearbox
} from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers: { [key: string]: ({ chainId }: { chainId: number }) => Promise<string[]> } = {
  beefy,
  yearn,
  convex,
  stargate,
  compoundV2,
  compoundV3,
  flux,
  velodrome,
  aaveV2,
  aaveV3,
  origin,
  idle,
  gearbox,
  curve,
  radiant,
  ellipsis,
  aura,
  alpacaV1,
  alpacaV2,
  default: assetDefault
};

export default ProtocolAssetResolvers;