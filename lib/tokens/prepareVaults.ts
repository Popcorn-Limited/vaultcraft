import axios from "axios";
import { Token, TokenByAddress, TokenType, VaultDataByAddress } from "@/lib/types";
import { getAddress } from "viem";
import { EMPTY_BALANCE } from "@/lib/utils/helpers";

export async function prepareVaults(vaultsData: VaultDataByAddress, assets: TokenByAddress, chainId: number): Promise<TokenByAddress> {
  const { data: vaultTokens } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/vaults/tokens/${chainId}.json`
  );

  let result: TokenByAddress = {}
  Object.values(vaultsData).forEach(vaultData => {
    const vault = vaultTokens[getAddress(vaultData.address)];
    const asset = assets[vaultData.asset];
    const price = (vaultData.assetsPerShare * (10 ** (vault.decimals - asset.decimals))) * asset.price

    result[getAddress(vault.address)] = {
      ...vaultTokens[getAddress(vault.address)],
      address: getAddress(vault.address),
      price,
      balance: EMPTY_BALANCE,
      totalSupply: vaultData.totalSupply,
      chainId: chainId,
      type: TokenType.Vault
    } as Token
  })

  return result;
}