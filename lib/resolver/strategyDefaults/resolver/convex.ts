import { getConvexPools } from "@/lib/external/convex";

export async function convex({ chainId, address }: { chainId: number, address: string }): Promise<any[]> {
    const pools = await getConvexPools({ chainId });


    return [pools.map(item => item[0].toLowerCase()).indexOf(address.toLowerCase())];
}