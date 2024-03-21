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
  chainId?: number;
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
};

export type VaultData = {
  address: Address;
  vault: Address;
  asset: Address;
  gauge?: Address;
  chainId: number;
  fees: FeeConfiguration;
  totalAssets: number;
  totalSupply: number;
  depositLimit: number;
  tvl: number;
  apy: number;
  totalApy: number;
  boostMin: number;
  boostMax: number;
  metadata: VaultMetadata;
  strategies: Strategy[];
};

type Strategy = {
  address: Address;
  metadata: StrategyMetadata;
  resolver: string;
  allocation: number;
  allocationPerc: number;
  apy: number;
}

type StrategyMetadata = {
  name: string;
  description: string;
}

type LockVaultLock = {
  unlockTime: number;
  amount: number;
  rewardShares: number;
  daysToUnlock: number;
};

export type LockVaultData = {
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
  strategyShares: bigint;
  rewardAddresses: Address[];
  rewards: RewardToken[];
  lock: LockVaultLock;
};

export type RewardToken = Token & {
  rewardBalance: number;
  userIndex: number;
  globalIndex: number;
  rewardApy: number;
};

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
  | "multi-strategy-vault-v1";
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
  ZapUnstakeAndWithdraw,
}

export enum LockVaultActionType {
  Deposit,
  IncreaseAmount,
  Withdrawal,
  Claim,
  ZapDeposit,
  ZapIncreaseAmount,
  ZapWithdrawal,
}

export enum KelpVaultActionType {
  Deposit,
  Withdrawal,
  ZapDeposit,
  EthxZapDeposit,
  ZapWithdrawal,
}

export enum DepositVaultActionType {
  Supply,
  Borrow,
  Deposit
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
  asset: Token;
  supplyAmount: number;
  borrowAmount: number;
  balance: number;
}

export enum ZapProvider {
  none,
  notFound,
  enso,
  zeroX,
  oneInch,
  paraSwap,
  openOcean
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