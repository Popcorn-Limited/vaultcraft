import { constants } from "ethers";

const AVAILABLE_ASSETS: { [key: number]: string[] } = {
  1: ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
  42161: ["0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"],
  137: ["0x2791bca1f2de4661ed88a30c99a7a9449aa84174"]
} // Just USDC on each chain at the moment

export async function compoundV3({ chainId }: { chainId: number }): Promise<string[]> {
  return Object.keys(AVAILABLE_ASSETS).includes(String(chainId)) ? AVAILABLE_ASSETS[chainId] : [constants.AddressZero];
}