import { mainnet } from "wagmi";

const MAINNET_ASSETS = ["0x6B175474E89094C44Da98b954EedeAC495271d0F", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "0xdAC17F958D2ee523a2206206994597C13D831ec7", "0x853d955aCEf822Db058eb8505911ED77F175b99e"] // DAI, USDC, USDT, FRAX

export async function flux({ chainId }: { chainId: number }): Promise<string[]> {
  return chainId === mainnet.id ? MAINNET_ASSETS.map(token => token.toLowerCase()) : [];
}