import { TokenByAddress, TokenType, VaultData } from "@/lib/types";
import { PublicClient } from "viem";
import { GaugeAbi } from "../constants";

export async function prepareGauges(vaultsWithGauges: VaultData[], vaults: TokenByAddress, client: PublicClient): Promise<TokenByAddress> {
  // @ts-ignore
  const res = await client.multicall({
    contracts: vaultsWithGauges.map(vault => {
      return [
        {
          address: vault.gauge!,
          abi: GaugeAbi,
          functionName: "totalSupply",
        },
        {
          address: vault.gauge!,
          abi: GaugeAbi,
          functionName: "decimals",
        }]
    }).flat(),
    allowFailure: false
  })

  let result: TokenByAddress = {}
  vaultsWithGauges.forEach((vault, i) => {
    if (i > 0) i = i * 2;

    result[vault.gauge!] = {
      address: vault.gauge!,
      name: `${vaults[vault.address].name}-gauge`,
      symbol: `st-${vaults[vault.address].symbol}`,
      decimals: Number(res[i + 1]),
      logoURI: "/images/tokens/vcx.svg", // wont be used, just here for consistency
      balance: 0,
      totalSupply: Number(res[i]),
      price: vaults[vault.address].price * (10 ** (Number(res[i + 1]) - vaults[vault.address].decimals)),
      chainId: vault.chainId,
      type: TokenType.Gauge
    }
  }
  )

  return result;
}