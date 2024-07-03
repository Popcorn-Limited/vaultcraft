import { Chain } from "viem";

export const xLayer = {
  id: 196,
  name: 'X Layer',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.xlayer.tech'] },
    public: { http: ['https://rpc.xlayer.tech'] },
  },
  blockExplorers: {
    default: { name: 'Okx Exlporer', url: 'https://www.okx.com/web3/explorer/xlayer' },
  },
  contracts: {
    multicall3: { address: "0xca11bde05977b3631167028862be2a173976ca11", blockCreated: 47416 }
  },
  testnet: false
} as const satisfies Chain