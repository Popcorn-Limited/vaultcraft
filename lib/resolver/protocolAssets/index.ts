import { beefy, assetDefault, yearn, aaveV3 } from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers = {
  beefy,
  yearn,
  aaveV3,
  default: assetDefault
};

export default ProtocolAssetResolvers;