import {
  Chain,
  arbitrum,
  mainnet,
  optimism,
  polygon,
} from "viem/chains";
import { xLayer } from "@/lib/constants";

export enum ChainId {
  Ethereum = 1,
  Goerli = 5,
  Arbitrum = 42161,
  Polygon = 137,
  Localhost = 1337,
  BNB = 56,
  RemoteFork = 31338,
  Optimism = 10,
  EthSepolia = 11155111,
  ArbSepolia = 421614,
  ALL = 0,
  polygonMumbai = 80001,
  XLayer = 196
}

export const networkMap: { [key: number]: string } = {
  [ChainId.Ethereum]: "Ethereum",
  [ChainId.Goerli]: "Goerli",
  [ChainId.Arbitrum]: "Arbitrum",
  [ChainId.Polygon]: "Polygon",
  [ChainId.Localhost]: "Localhost",
  [ChainId.RemoteFork]: "RemoteFork",
  [ChainId.Optimism]: "Optimism",
  [ChainId.BNB]: "BSC",
  [ChainId.EthSepolia]: "EthSepolia",
  [ChainId.ArbSepolia]: "ArbSepolia",
  [ChainId.ALL]: "All Networks",
  [ChainId.XLayer]: "XLayer"
};

export const networkLogos: { [key: number]: string } = {
  [ChainId.ALL]: "/images/networks/allNetworks.svg",
  [ChainId.Ethereum]: "/images/networks/ethereum.svg",
  [ChainId.Polygon]: "/images/networks/polygon.svg",
  [ChainId.Arbitrum]: "/images/networks/arbitrum.svg",
  [ChainId.Optimism]: "/images/networks/optimism.svg",
  [ChainId.BNB]: "/images/networks/binanceSmartChain.png",
  [ChainId.Goerli]: "/images/networks/ethTestnet.svg",
  [ChainId.Localhost]: "/images/networks/ethTestnet.svg",
  [ChainId.RemoteFork]: "/images/networks/ethTestnet.svg",
  [ChainId.EthSepolia]: "/images/networks/ethTestnet.svg",
  [ChainId.ArbSepolia]: "/images/networks/arbTestnet.svg",
  [ChainId.XLayer]: "/images/networks/xLayer.png"
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
  [ChainId.EthSepolia]: "https://ethereum-sepolia.publicnode.com",
  [ChainId.ArbSepolia]: "https://sepolia-rollup.arbitrum.io/rpc",
  [ChainId.XLayer]: "https://rpc.xlayer.tech"
};

export const SUPPORTED_NETWORKS = [mainnet, polygon, optimism, arbitrum, xLayer]

export const ChainById: { [key: number]: Chain } = {
  1: mainnet,
  137: polygon,
  10: optimism,
  42161: arbitrum,
  196: xLayer
}