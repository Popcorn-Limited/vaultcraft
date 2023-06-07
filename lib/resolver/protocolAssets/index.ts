import { assetDefault, beefy, yearn, convex, stargate, compound, velodrome } from "./resolver";

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
  default: assetDefault
};

export default ProtocolAssetResolvers;