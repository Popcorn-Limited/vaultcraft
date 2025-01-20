import { Address, PublicClient, WalletClient } from "viem";

export type Balance = {
  value: bigint;
  formatted: string;
  formattedUSD: string;
}

export type Token = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  balance: Balance;
  price: number;
  totalSupply: bigint;
  chainId?: number;
  type?: TokenType;
};

export enum TokenType {
  Vault,
  Gauge,
  Asset,
}

export type VaultFees = {
  deposit: bigint;
  withdrawal: bigint;
  management: bigint;
  performance: bigint;
};

export type VaultData = {
  address: Address;
  vault: Address;
  asset: Address;
  gauge?: Address;
  safes?: Address[]; // first safe is the main safe, rest is optional
  chainId: number;
  fees: VaultFees;
  totalAssets: bigint;
  totalSupply: bigint;
  assetsPerShare: number;
  depositLimit: bigint;
  withdrawalLimit: bigint;
  minLimit: bigint;
  tvl: number;
  apyData: ApyData;
  gaugeData?: GaugeData;
  metadata: VaultMetadata;
  strategies: Strategy[];
  idle: bigint;
  liquid: bigint;
  points: Point[]
};

export type Point = {
  provider: string;
  multiplier: number;
}

export type ApyData = {
  targetApy: number;
  baseApy: number;
  rewardApy: number;
  totalApy: number;
  apyHist: LlamaApy[];
  apyId: string;
  apySource?: "custom" | "defillama";
}

export type LlamaApy = {
  apy: number;
  apyBase: number;
  apyReward: number;
  tvl: number;
  date: Date;
}

export type StrategyType = "AnyToAnyV1" | "AnyToAnyCompounderV1" | "Vanilla" | "LeverageV1"  | "LeverageV2"

export type Strategy = {
  address: Address;
  asset: Address;
  yieldToken?: Address;
  metadata: StrategyMetadata;
  resolver: string;
  allocation: bigint;
  allocationPerc: number;
  apyData: ApyData;
  totalAssets: bigint;
  totalSupply: bigint;
  assetsPerShare: number;
  idle: bigint;
  leverage?: number;
}

export type StrategyMetadata = {
  name: string;
  protocol: string;
  description: string;
  type: StrategyType;
}

export enum VaultLabel {
  experimental = "Experimental",
  deprecated = "Deprecated",
  new = "New",
  leverage = "Leverage",
  points = "Points"
}

export type VaultMetadata = {
  vaultName?: string;
  labels?: VaultLabel[];
  description?: string;
  type:
  | "single-asset-vault-v1"
  | "single-asset-lock-vault-v1"
  | "multi-strategy-vault-v1"
  | "multi-strategy-vault-v2"
  | "multi-strategy-vault-v2.5"
  | "safe-vault-v1";
  creator: Address;
  feeRecipient: Address;
};

export type SimulationResponse = {
  request: any | null;
  success: boolean;
  error: string | null;
};

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
  vault: Address;
  gauge: Address;
  lowerAPR: number;
  upperAPR: number;
  annualEmissions: number;
  annualRewardValue: number;
  rewardApy: RewardApy;
  workingSupply: number;
  workingBalance: number;
}

export type RewardApy = {
  rewards: TokenReward[];
  annualRewardValue: number;
  apy: number;
}

export type TokenReward = {
  address: Address;
  emissions: number;
  emissionsValue: number;
  apy: number;
}

export type ClaimableReward = {
  token: Token;
  amount: number;
  value: number;
}

export enum VaultActionType {
  Deposit,
  Withdrawal,
  RequestWithdrawal,
  CancelRequest,
  Stake,
  Unstake,
  DepositAndStake,
  UnstakeAndWithdraw,
  UnstakeAndRequestWithdrawal,
  UnstakeAndRequestFulfillWithdraw,
  FulfillAndWithdraw,
  RequestFulfillAndWithdraw,
  ZapDeposit,
  ZapWithdrawal,
  ZapDepositAndStake,
  ZapUnstakeAndWithdraw,
  ZapFulfillAndWithdraw,
  ZapRequestFulfillAndWithdraw,
  ZapUnstakeAndRequestFulfillWithdraw
}

export enum VaultAction {
  depositApprove,
  stakeApprove,
  depositAndStakeApprove,
  unstakeAndWithdrawApprove,
  asyncApprove,
  asyncRouterApprove,
  zapApprove,
  deposit,
  stake,
  depositAndStake,
  withdraw,
  requestWithdrawal,
  cancelRequest,
  fulfillAndWithdraw,
  requestFulfillAndWithdraw,
  unstake,
  unstakeAndWithdraw,
  unstakeAndRequestWithdrawal,
  unstakeAndRequestFulfillWithdraw,
  zap,
  done
}

export type DuneQueryResult<T> = {
  result: {
    rows: T[];
  };
};

export enum ZapProvider {
  none,
  notFound,
  enso,
  zeroX,
  oneInch,
  paraSwap,
  openOcean,
  kyberSwap
}

export type TokenByAddress = {
  [key: Address]: Token;
}

export type VaultDataByAddress = {
  [key: Address]: VaultData
}

export type AddressByChain = {
  [key: number]: Address
}

export type StrategyByAddress = {
  [key: Address]: Strategy
}

export type StrategiesByChain = {
  [key: number]: StrategyByAddress
}

export type AddressesByChain = {
  [key: number]: Address[]
}

export type VaultronStats = {
  level: number;
  xp: number;
  animation: string;
  image: string;
  tokenId: number;
  totalXp: number;
}

export type VaultAllocation = {
  index: bigint;
  amount: bigint;
};

export type VaultV1Settings = {
  proposedStrategies: Address[];
  proposedStrategyTime: number;
  proposedFees: VaultFees;
  proposedFeeTime: number;
  paused: boolean;
  feeBalance: number;
  accruedFees: number;
  owner: Address;
}

export type VaultV2Settings = {
  proposedStrategies: Address[];
  proposedStrategyTime: number;
  withdrawalQueue: number[];
  proposedWithdrawalQueue: number[];
  depositIndex: number;
  proposedDepositIndex: number;
  paused: boolean;
  owner: Address;
  fees: VaultsV2FeeConfig;
  accruedFees: number;
}

export type VaultsV2Fee = {
  value: number | string;
  exists: boolean;
}

export type VaultsV2FeeConfig = {
  performance: VaultsV2Fee;
  management: VaultsV2Fee;
}

export type Transaction = {
  from: Address;
  to: Address;
  data: Address;
  value: bigint;
}

export type RequestBalance = {
  pendingShares: bigint;
  requestTime: bigint;
  claimableShares: bigint;
  claimableAssets: bigint;
}