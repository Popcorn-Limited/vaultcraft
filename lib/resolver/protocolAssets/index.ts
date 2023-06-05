import { beefy, assetDefault, yearn, convex } from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers = {
  beefy,
  convex,
  yearn,
  default: assetDefault
};

export default ProtocolAssetResolvers;