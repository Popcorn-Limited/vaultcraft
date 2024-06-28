import axios from "axios";
import { TokenByAddress, TokenType, VaultDataByAddress } from "@/lib/types";
import { getAddress } from "viem";

export async function prepareVaults(vaultsData: VaultDataByAddress, assets: TokenByAddress, chainId: number): Promise<TokenByAddress> {
  const { data: vaultTokens } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/tokens/${chainId}.json`
  );

  let result: TokenByAddress = {}
  Object.values(vaultsData).forEach(vault => {
    const assetsPerShare =
      vault.totalSupply > 0 ? (vault.totalAssets + 1) / (vault.totalSupply + 1e9) : Number(1e-9);
    const price = (assetsPerShare * assets[vault.asset].price) * 1e9; // @dev normalize vault price for previews (watch this if errors occur)

    result[getAddress(vault.address)] = {
      ...vaultTokens[getAddress(vault.address)],
      address: getAddress(vault.address),
      price,
      balance: 0,
      totalSupply: vault.totalSupply,
      chainId: chainId,
      type: TokenType.Vault
    }
  })

  return result;
}