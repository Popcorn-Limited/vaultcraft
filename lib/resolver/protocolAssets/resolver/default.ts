import assets from "@/lib/constants/assets.json";



export async function assetDefault({ chainId }: { chainId: number }): Promise<string[]> {
  return assets.map(token => token.address["1"])
}