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
    `https://shortcuts-backend-dynamic-int.herokuapp.com/api/v1/tokens?address=${address}&chainId=${chainId}&page=1`
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
