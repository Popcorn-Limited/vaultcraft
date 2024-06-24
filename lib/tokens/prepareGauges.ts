import { TokenByAddress, TokenType, VaultData } from "@/lib/types";
import { PublicClient } from "viem";
import { GaugeAbi } from "@/lib/constants";
import { mainnet } from "wagmi";

export async function prepareGauges(vaultsWithGauges: VaultData[], vaults: TokenByAddress, client: PublicClient): Promise<TokenByAddress> {
  const ts = await client.multicall({
    contracts: vaultsWithGauges.map(vault => {
      return {
        address: vault.gauge!,
        abi: GaugeAbi,
        functionName: "totalSupply"
      }
    }),
    allowFailure: false
  })

  let result: TokenByAddress = {}
  vaultsWithGauges.forEach((vault, i) => {
    const gaugeDecimals = vault.chainId === mainnet.id ? vaults[vault.address].decimals : 18;
    const totalSupply = Number(ts[i]);

    result[vault.gauge!] = {
      address: vault.gauge!,
      name: `${vaults[vault.address].name}-gauge`,
      symbol: `st-${vaults[vault.address].symbol}`,
      decimals: gaugeDecimals,
      logoURI: "/images/tokens/vcx.svg", // wont be used, just here for consistency
      balance: 0,
      totalSupply: totalSupply,
      price: vaults[vault.address].price,
      chainId: vault.chainId,
      type: TokenType.Gauge
    }
  })

  return result;
}