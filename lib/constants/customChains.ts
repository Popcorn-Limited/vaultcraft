import { Chain } from "viem";

export const xLayer = {
  id: 196,
  name: 'X Layer',
  network: "xLayer",
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.xlayer.tech'] },
    public: { http: ['https://rpc.xlayer.tech'] },
  },
  blockExplorers: {
    default: { name: 'Okx Exlporer', url: 'https://www.okx.com/web3/explorer/xlayer' },
  },
  testnet: false
} as const satisfies Chain