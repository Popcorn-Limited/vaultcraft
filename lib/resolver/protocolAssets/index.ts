import { assetDefault, beefy, yearn, convex, stargate, compoundV2, flux, velodrome, aaveV2, aaveV3 } from "./resolver";

export type ProtocolAssetResolver = (
  chainId: number,
) => Promise<string[]>;

export type ProtocolAssetResolvers = typeof ProtocolAssetResolvers;

export const ProtocolAssetResolvers: { [key: string]: ({ chainId }: { chainId: number }) => Promise<string[]> } = {
  beefy,
  yearn,
  convex,
  stargate,
  compoundV2,
  flux,
  velodrome,
  aaveV2,
  aaveV3,
  default: assetDefault
};

export default ProtocolAssetResolvers;