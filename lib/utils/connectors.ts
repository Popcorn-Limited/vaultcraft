import { arbitrum, bsc, localhost, mainnet, optimism, polygon } from "viem/chains";

export enum ChainId {
  Ethereum = 1,
  Goerli = 5,
  Arbitrum = 42161,
  Polygon = 137,
  Localhost = 1337,
  BNB = 56,
  RemoteFork = 31338,
  Optimism = 10,
  ALL = 0,
}

export enum named {
  all = "-1",
  eth = "1",
  goerly = "5",
  arb = "42161",
  poly = "137",
  localhost = "1337",
  bnb = "56",
  remotefork = "31338",
  op = "10",
  ALL = 0,
}

export enum ChainIdHex {
  Ethereum = "0x1",
  Goerli = "0x5",
  Arbitrum = "0xa4b1",
  Polygon = "0x89",
  Localhost = "0x7a69",
  BNB = "0x38",
  Optimism = "0xa",
}

export const HexToChain = {
  "0x1": ChainId.Ethereum,
  "0x5": ChainId.Goerli,
  "0xa4b1": ChainId.Arbitrum,
  "0x89": ChainId.Polygon,
  "0x7a69": ChainId.Localhost,
  "0x38": ChainId.BNB,
  "0xa": ChainId.Optimism,
};

export const supportedChainIds = [
  ChainId.Ethereum,
  ChainId.Goerli,
  ChainId.Arbitrum,
  ChainId.Polygon,
  ChainId.Localhost,
  ChainId.BNB,
  ChainId.RemoteFork,
  ChainId.Optimism,
  ChainId.ALL,
];

export const networkMap: { [key: number]: string } = {
  [ChainId.Ethereum]: "Ethereum",
  [ChainId.Goerli]: "Goerli",
  [ChainId.Arbitrum]: "Arbitrum",
  [ChainId.Polygon]: "Polygon",
  [ChainId.Localhost]: "Localhost",
  [ChainId.RemoteFork]: "RemoteFork",
  [ChainId.Optimism]: "Optimism",
  [ChainId.BNB]: "BSC",
  [ChainId.ALL]: "All Networks",
};

export const networkLogos: { [key: number]: string } = {
  [ChainId.ALL]: "/images/networks/allNetworks.svg",
  [ChainId.Ethereum]: "/images/networks/ethereum.svg",
  [ChainId.Polygon]: "/images/networks/polygon.svg",
  [ChainId.Arbitrum]: "/images/networks/arbitrum.svg",
  [ChainId.Optimism]: "/images/networks/optimism.svg",
  [ChainId.BNB]: "/images/networks/binanceSmartChain.png",
  [ChainId.Goerli]: "/images/networks/testNets.png",
  [ChainId.Localhost]: "/images/networks/testNets.png",
  [ChainId.RemoteFork]: "/images/networks/testNets.png",
};
export const RPC_URLS: { [key: number]: string } = {
  [ChainId.Ethereum]: `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.Arbitrum]: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.Polygon]: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.Optimism]: `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.Goerli]: "https://goerli.blockpi.network/v1/rpc/public",
  [ChainId.BNB]: `https://bsc-dataseed1.binance.org`,
  [ChainId.Localhost]: `http://localhost:8545`,
  [ChainId.RemoteFork]: `http://localhost:8545`,
};

export const SUPPORTED_NETWORKS = [mainnet, polygon, optimism, arbitrum]