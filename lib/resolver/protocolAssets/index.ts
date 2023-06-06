import { beefy, assetDefault, yearn, aaveV2 } from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers = {
  beefy,
  yearn,
  aaveV2,
  default: assetDefault
};

export default ProtocolAssetResolvers;