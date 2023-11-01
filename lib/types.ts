import { ProtocolName } from "vaultcraft-sdk";
import { Address } from "viem";

export type Token = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  balance: number;
  price: number;
};

export type TokenConstant = {
  chains: number[];
  address: { [key: string]: Address };
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export type VaultData = {
  address: Address;
  vault: Token;
  asset: Token;
  adapter: Token;
  gauge?: Token;
  totalAssets: number;
  totalSupply: number;
  assetsPerShare: number;
  assetPrice: number;
  pricePerShare: number;
  tvl: number;
  fees: {
    deposit: number;
    withdrawal: number;
    management: number;
    performance: number;
  };
  depositLimit: number;
  metadata: VaultMetadata;
  chainId: number;
}

export type VaultMetadata = {
  creator: Address;
  cid: string;
  optionalMetadata: OptionalMetadata;
  vaultName?: string;
}

export type OptionalMetadata = {
  token: {
    name: string;
    description: string;
  };
  protocol: {
    name: string;
    description: string;
  }
  strategy: {
    name: string;
    description: string;
  },
  getTokenUrl?: string;
  resolver?: ProtocolName;
}

export type SimulationResponse = {
  request: any | null;
  success: boolean;
  error: string | null;
}

export interface IconProps {
  color: string;
  size: string;
  className?: string;
}