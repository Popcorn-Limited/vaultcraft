export type CHAIN_ID_TYPE = 1 | 10 | 100 | 137 | 250 | 1284 | 2222 | 42161 | 42220 | 43114 | 1313161554;
export type REFERENCE_ASSET_TYPE = 'USD' | 'EUR' | 'BTC' | 'ETH' | 'LINK' | 'CRYPTO' | 'OTHER';

export interface IDict<T> {
  [index: string]: T,
}

export interface IPoolData {
  name: string,
  full_name: string,
  symbol: string,
  reference_asset: REFERENCE_ASSET_TYPE,
  swap_address: string,
  token_address: string,
  gauge_address: string,
  deposit_address?: string,
  sCurveRewards_address?: string,
  reward_contract?: string,
  implementation_address?: string,  // Only for testing
  is_plain?: boolean,
  is_lending?: boolean,
  is_meta?: boolean,
  is_crypto?: boolean,
  is_fake?: boolean,
  is_factory?: boolean,
  base_pool?: string,
  meta_coin_idx?: number,
  underlying_coins: string[],
  wrapped_coins: string[],
  underlying_coin_addresses: string[],
  wrapped_coin_addresses: string[],
  underlying_decimals: number[],
  wrapped_decimals: number[],
  use_lending?: boolean[],
  swap_abi: any,
  gauge_abi: any,
  deposit_abi?: any,
  sCurveRewards_abi?: any,
  in_api?: boolean,
}

export interface PoolResponse {
  id: string,
  address: string,
  coinsAddress: string[],
  decimals: string[],
  virtualPrice: string,
  amplificationCoefficient: string,
  assetType: string,
  totalSupply: string,
  name: string,
  lpTokenAddress: string,
  symbol: string,
  priceOracle: number,
  poolUrls: { swap: string[], deposit: string[], withdraw: string[] },
  implementation: string,
  assetTypeName: string
  coins: Coin[],
  usdTotal: number,
  isMetaPool: boolean,
  usdTotalExcludingBasePool: number,
  blockchainId: string,
  registryId: string,
}

interface Coin {
  address: string,
  decimals: string,
  symbol: string,
  poolBalance: string,
  usdPrice: number,
  isBasePoolLpToken: boolean
}

export interface IRouteStep {
  poolId: string,
  poolAddress: string,
  inputCoinAddress: string,
  outputCoinAddress: string,
  i: number,
  j: number,
  swapType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
  swapAddress: string,  // for swapType == 4
}

export type IRoute = IRouteStep[];

export interface IRouteTvl {
  route: IRoute,
  minTvl: number,
  totalTvl: number,
}

export interface INativeToken {
  symbol: string,
  wrappedSymbol: string,
  address: string,
  wrappedAddress: string,
}

export interface CurveRoute {
  route: string[];
  swapParams: BigInt[][]
}