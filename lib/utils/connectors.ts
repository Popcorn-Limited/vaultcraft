import {
  Chain,
  arbitrum,
  avalanche,
  base,
  bsc,
  fraxtal,
  mainnet,
  optimism,
  polygon,
  xLayer,
} from "viem/chains";

export enum ChainId {
  ALL = 0,
  Ethereum = 1,
  Optimism = 10,
  Arbitrum = 42161,
  Polygon = 137,
  BNB = 56,
  XLayer = 196,
  Base = 8453,
  Fraxtal = 252,
  Avalanche = 43114
}

export const networkMap: { [key: number]: string } = {
  [ChainId.ALL]: "All Networks",
  [ChainId.Ethereum]: "Ethereum",
  [ChainId.Optimism]: "Optimism",
  [ChainId.Arbitrum]: "Arbitrum",
  [ChainId.Polygon]: "Polygon",
  [ChainId.BNB]: "BSC",
  [ChainId.XLayer]: "XLayer",
  [ChainId.Base]: "Base",
  [ChainId.Fraxtal]: "Fraxtal",
  [ChainId.Avalanche]: "Avalanche"
};

export const networkLogos: { [key: number]: string } = {
  [ChainId.ALL]: "/images/networks/allNetworks.svg",
  [ChainId.Ethereum]: "/images/networks/ethereum.svg",
  [ChainId.Optimism]: "/images/networks/optimism.svg",
  [ChainId.Arbitrum]: "/images/networks/arbitrum.svg",
  [ChainId.Polygon]: "/images/networks/polygon.svg",
  [ChainId.BNB]: "/images/networks/binanceSmartChain.png",
  [ChainId.XLayer]: "/images/networks/xLayer.png",
  [ChainId.Base]: "/images/networks/base.svg",
  [ChainId.Fraxtal]: "/images/networks/fraxtal.svg",
  [ChainId.Avalanche]: "/images/networks/avalanche.svg"
};

export const RPC_URLS: { [key: number]: string } = {
  [ChainId.Ethereum]: `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.Optimism]: `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.Arbitrum]: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.Polygon]: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.BNB]: `https://bnb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.XLayer]: "https://rpc.xlayer.tech",
  [ChainId.Base]: `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  [ChainId.Fraxtal]: `https://rpc.frax.com`,
  [ChainId.Avalanche]: `https://avax-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
};

export const SUPPORTED_NETWORKS: Chain[] = [
  mainnet,
  optimism,
  arbitrum,
  polygon,
  bsc,
  {
    ...xLayer,
    contracts: {
      multicall3: {
        address: "0xca11bde05977b3631167028862be2a173976ca11",
        blockCreated: 47416
      }
    }
  },
  base,
  fraxtal,
  avalanche,
]

export const GAUGE_NETWORKS = [1, 10, 42161];

export const ChainById: { [key: number]: Chain } = {
  1: mainnet,
  10: optimism,
  42161: arbitrum,
  137: polygon,
  56: bsc,
  196: xLayer,
  8453: base,
  252: fraxtal,
  43114: avalanche
}
