import { beefy, assetDefault, yearn, compound } from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers = {
  beefy,
  compound,
  yearn,
  default: assetDefault
};

export default ProtocolAssetResolvers;