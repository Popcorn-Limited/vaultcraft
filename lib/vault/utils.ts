import axios from "axios";
import { Address, getAddress } from "viem";
import { Token, VaultData } from "@/lib/types";

export async function isDefiPosition({
  address,
  chainId,
}: {
  address: Address;
  chainId: number;
}): Promise<boolean> {
  const { data } = await axios.get(
    `https://api.enso.finance/api/v1/tokens?underlyingTokens=&address=${address}&chainId=${chainId}&type=defi&page=1`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ENSO_API_KEY}`,
      },
    }
  );
  return data.data.length > 0;
}

export function getTokenOptions(
  vaultData: VaultData,
  zapAssets?: Token[]
): Token[] {
  const tokenOptions = [vaultData.vault, vaultData.asset];
  if (!!vaultData.gauge) tokenOptions.push(vaultData.gauge);
  if (zapAssets)
    tokenOptions.push(
      ...zapAssets.filter(
        (asset) =>
          getAddress(asset.address) !== getAddress(vaultData.asset.address)
      )
    );
  return tokenOptions;
}
