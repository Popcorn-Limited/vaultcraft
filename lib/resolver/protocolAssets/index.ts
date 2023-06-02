import { beefy, stargate, assetDefault } from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers = {
  beefy,
  stargate,
  default: assetDefault
};

export default ProtocolAssetResolvers;