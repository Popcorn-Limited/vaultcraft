import { assetDefault, beefy, yearn, convex, stargate, compound, velodrome, aaveV2 } from "./resolver";


export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers = {
  beefy,
  yearn,
  convex,
  stargate,
  compound,
  velodrome,
  aaveV2,
  default: assetDefault
};

export default ProtocolAssetResolvers;