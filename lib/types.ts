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
  totalSupply: number;
  chainId?: number;
  type?: TokenType;
};

export enum TokenType {
  Vault,
  Gauge,
  Asset,
}

export type Asset = {
  chains: number[];
  address: { [key: string]: Address };
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  apy?: number;
};

export type VaultFees = {
  deposit: number;
  withdrawal: number;
  management: number;
  performance: number;
};

export type VaultData = {
  address: Address;
  vault: Address;
  asset: Address;
  gauge?: Address;
  chainId: number;
  fees: VaultFees;
  totalAssets: number;
  totalSupply: number;
  assetsPerShare: number;
  depositLimit: number;
  tvl: number;
  apy: number;
  totalApy: number;
  apyHist: LlamaApy[];
  apyId: string;
  gaugeData?: GaugeData;
  metadata: VaultMetadata;
  strategies: Strategy[];
};

export type LlamaApy = {
  apy: number;
  apyBase: number;
  apyReward: number;
  tvl: number;
  date: Date;
}

export type Strategy = {
  address: Address;
  metadata: StrategyMetadata;
  resolver: string;
  allocation: number;
  allocationPerc: number;
  apy: number;
  apyHist: LlamaApy[];
  apyId: string;
  apySource: "custom" | "defillama"
}

type StrategyMetadata = {
  name: string;
  protocol: string;
  description: string;
}

export enum VaultLabel {
  experimental = "Experimental",
  deprecated = "Deprecated",
  new = "New",
}

export type VaultMetadata = {
  vaultName?: string;
  labels?: VaultLabel[];
  description?: string;
  type:
  | "single-asset-vault-v1"
  | "single-asset-lock-vault-v1"
  | "multi-strategy-vault-v1"
  | "multi-strategy-vault-v2";
  creator: Address;
  feeRecipient: Address;
};

export type OptionalMetadata = {
  token: {
    name: string;
    description: string;
  };
  protocol: {
    name: string;
    description: string;
  };
  strategy: {
    name: string;
    description: string;
  };
  getTokenUrl?: string;
  resolver?: ProtocolName;
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
  ZapUnstakeAndWithdraw,
}

export type DuneQueryResult<T> = {
  result: {
    rows: T[];
  };
};

export type VoteUserSlopes = {
  slope: bigint,
  power: bigint,
  end: bigint,
}

export type UserAccountData = {
  totalCollateral: number;
  totalBorrowed: number;
  netValue: number;
  totalSupplyRate: number;
  totalBorrowRate: number;
  netRate: number;
  ltv: number;
  healthFactor: number;
}

export type ReserveDataResponse = {
  id: bigint;
  underlyingAsset: string;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  interestRateStrategyAddress: string;
  liquidityIndex: bigint;
  variableBorrowIndex: bigint;
  currentLiquidityRate: bigint;
  currentVariableBorrowRate: bigint;
  currentStableBorrowRate: bigint;
  lastUpdateTimestamp: bigint;
  configuration: bigint;
  liquidityRate: bigint;
  stableBorrowRate: bigint;
  averageStableBorrowRate: bigint;
  variableBorrowRate: bigint;
  totalPrincipalStableDebt: bigint;
  totalScaledVariableDebt: bigint;
  totalDeposits: bigint;
  totalLiquidity: bigint;
  utilizationRate: bigint;
  reserveFactor: bigint;
  accruedToTreasury: bigint;
  unbacked: bigint;
  isolationModeTotalDebt: bigint;
  eModeCategoryId: bigint;
  debtCeiling: bigint;
  debtOutstanding: bigint;
  coverageRatio: bigint;
}

export type ReserveData = {
  ltv: number;
  liquidationThreshold: number;
  liquidationPenalty: number;
  supplyRate: number;
  borrowRate: number;
  asset: Address;
  supplyAmount: number;
  borrowAmount: number;
  supplyValue: number;
  borrowValue: number;
  balance: number;
  supplyBalance: number;
  balanceValue: number;
}

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
}