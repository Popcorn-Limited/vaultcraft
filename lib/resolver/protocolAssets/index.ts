import { beefy, assetDefault, yearn, velodrome } from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers = {
  beefy,
  velodrome,
  yearn,
  default: assetDefault
};

export default ProtocolAssetResolvers;