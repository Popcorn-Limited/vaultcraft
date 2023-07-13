import { Contract } from "ethers";
import { resolveAdapterDefaults } from "@/lib/resolver/adapterDefaults/adapterDefaults";
import { RPC_PROVIDERS } from "@/lib/connectors";

export async function compoundV2Apy({ chainId, address, resolver }: { chainId: number, address: string, resolver: string }): Promise<number> {
  const [cTokenAddress] = await resolveAdapterDefaults({ chainId, address, resolver })
  const cToken = new Contract(
    // @ts-ignore
    cTokenAddress,
    ['function supplyRatePerBlock() public view returns (uint)'],
    // @ts-ignore
    RPC_PROVIDERS[chainId]
  );

  const supplyRate = await cToken.supplyRatePerBlock();

  return (((Math.pow((Number(supplyRate) / 1e18 * 7200) + 1, 365))) - 1) * 100
}

export async function compoundV2({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  return compoundV2Apy({ chainId, address, resolver: "compoundV2" })
}
