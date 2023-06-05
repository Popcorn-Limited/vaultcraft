import { beefy, assetDefault, yearn, stargate } from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers = {
  beefy,
  stargate,
  yearn,
  default: assetDefault
};

export default ProtocolAssetResolvers;