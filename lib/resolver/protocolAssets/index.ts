import { beefy, convex, assetDefault } from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers = {
  beefy,
  convex,
  default: assetDefault
};

export default ProtocolAssetResolvers;