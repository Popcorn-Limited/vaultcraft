import { beefy, compound, assetDefault } from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers = {
  beefy,
  compound,
  default: assetDefault
};

export default ProtocolAssetResolvers;