import axios from "axios";
import { TokenByAddress, TokenType, VaultDataByAddress } from "@/lib/types";
import { getAddress } from "viem";

export async function prepareVaults(vaultsData: VaultDataByAddress, assets: TokenByAddress, chainId: number): Promise<TokenByAddress> {
  const { data: vaultTokens } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/tokens/${chainId}.json`
  );

  let result: TokenByAddress = {}
  Object.values(vaultsData).forEach(vaultData => {
    const vault = vaultTokens[getAddress(vaultData.address)];
    const asset = assets[vaultData.asset];
    const price = vaultData.assetsPerShare * asset.price

    result[getAddress(vaultData.address)] = {
      ...vault,
      address: getAddress(vaultData.address),
      price,
      balance: 0,
      totalSupply: vaultData.totalSupply,
      chainId: chainId,
      type: TokenType.Vault
    }
  })

  return result;
}