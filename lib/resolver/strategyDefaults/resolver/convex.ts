import { getConvexPools } from "@/lib/external/convex";
import { Address, getAddress } from "viem";

export async function convex({ chainId, address }: { chainId: number, address: Address }): Promise<any[]> {
    const pools = await getConvexPools({ chainId });

    return [pools.map(item => getAddress(item[0])).indexOf(address)];
}