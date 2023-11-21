import { ProtocolName } from "vaultcraft-sdk";
import { Address, PublicClient, WalletClient } from "viem";

export type Token = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  balance: number;
  price: number;
};

export type veAddresses = {
  VCX: Address;
  WETH_VCX_LP:Address;
  VE_VCX:Address;
  POP: Address;
  WETH: Address;
  BalancerPool: Address;
  BalancerOracle: Address;
  oVCX: Address;
  VaultRegistry: Address;
  BoostV2:Address;
  Minter: Address;
  TokenAdmin: Address;
  VotingEscrow: Address;
  GaugeController: Address;
  GaugeFactory: Address;
  SmartWalletChecker: Address;
  VotingEscrowDelegation: Address;
  VaultRouter: Address;
  FeeDistributor: Address;
};

export type Asset = {
  chains: number[];
  address: { [key: string]: Address };
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  apy?: number;
};

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
  color2?:string;
  size: string;
  className?: string;
}

export interface Clients {
  publicClient: PublicClient;
  walletClient: WalletClient;
}


export enum ActionType {
  Deposit,
  Withdrawal,
  Stake,
  Unstake,
  DepositAndStake,
  UnstakeAndWithdraw,
  ZapDeposit,
  ZapWithdrawal,
  ZapDepositAndStake,
  ZapUnstakeAndWithdraw
}
