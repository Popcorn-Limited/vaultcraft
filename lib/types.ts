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
  WETH_VCX_LP: Address;
  VE_VCX: Address;
  POP: Address;
  WETH: Address;
  BalancerPool: Address;
  BalancerOracle: Address;
  BalancerVault: Address;
  oVCX: Address;
  VaultRegistry: Address;
  BoostV2: Address;
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

export type FeeConfiguration = {
  deposit: number;
  withdrawal: number;
  management: number;
  performance: number;
}

export type VaultData = {
  address: Address;
  vault: Token;
  asset: Token;
  gauge?: Token;
  totalAssets: number;
  totalSupply: number;
  assetsPerShare: number;
  assetPrice: number;
  pricePerShare: number;
  tvl: number;
  fees: FeeConfiguration;
  depositLimit: number;
  metadata: VaultMetadata;
  chainId: number;
  apy: number;
  gaugeMinApy?: number;
  gaugeMaxApy?: number;
  totalApy: number;
}

type LockVaultLock = {
  unlockTime: number;
  amount: number;
  rewardShares: number;
  daysToUnlock: number;
}

export type LockVaultData = VaultData & {
  strategyShares: bigint;
  rewardAddresses: Address[];
  rewards: RewardToken[];
  lock: LockVaultLock;
}

export type RewardToken = Token & {
  rewardBalance: number;
  userIndex: number;
  globalIndex: number;
  rewardApy: number;
}

export enum VaultLabel {
  experimental = "Experimental",
  deprecated = "Deprecated"
}

export type VaultMetadata = {
  creator: Address;
  feeRecipient: Address;
  cid: string;
  optionalMetadata: OptionalMetadata;
  vaultName?: string;
  labels?: VaultLabel[];
  description?: string;
  type: "single-asset-vault-v1" | "single-asset-lock-vault-v1" | "multi-strategy-vault-v1"
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
  color2?: string;
  size: string;
  className?: string;
}

export interface Clients {
  publicClient: PublicClient;
  walletClient: WalletClient;
}

export type GaugeData = {
  [key: Address]: {
    address: Address;
    vault: Address;
    lowerAPR: number;
    upperAPR: number;
  };
}


export enum SmartVaultActionType {
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

export enum LockVaultActionType {
  Deposit,
  IncreaseAmount,
  Withdrawal,
  Claim,
  ZapDeposit,
  ZapIncreaseAmount,
  ZapWithdrawal
}

export enum KelpVaultActionType {
  Deposit,
  Withdrawal,
  ZapDeposit,
  EthxZapDeposit,
  ZapWithdrawal
}

export type DuneQueryResult<T> = {
  result: {
    rows: T[]
  }
}

export type VoteUserSlopes = {
  slope: bigint,
  power: bigint,
  end: bigint,
}
