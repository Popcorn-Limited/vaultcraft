import { beefy, velodrome, assetDefault } from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers = {
  beefy,
  velodrome,
  default: assetDefault
};

export default ProtocolAssetResolvers;