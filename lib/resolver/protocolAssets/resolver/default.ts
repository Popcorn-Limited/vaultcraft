import assets from "@/lib/constants/assets.json";

export async function assetDefault({ chainId }: { chainId: number }): Promise<string[]> {
  // @ts-ignore
  return assets.map(token => token.address[chainId]?.toLowerCase())
}