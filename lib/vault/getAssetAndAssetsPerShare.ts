import { Address, PublicClient } from "viem"
import { VaultAbi } from "../constants"

type AssetAndValue = {
  vault: Address,
  asset: Address,
  assetsPerShare: number
}

function prepareContract(address: Address) {
  const vaultContract = {
    address,
    abi: VaultAbi
  }
  return [{
    ...vaultContract,
    functionName: 'asset'
  },
  {
    ...vaultContract,
    functionName: 'totalAssets'
  },
  {
    ...vaultContract,
    functionName: 'totalSupply'
  }]
}

function prepareResult({ vault, asset, totalAssets, totalSupply }: { vault: Address, asset: Address, totalAssets: number, totalSupply: number }): AssetAndValue {
  const assetsPerShare = totalSupply === 0 ? 0 : Number(totalAssets) / Number(totalSupply)

  return { vault, asset, assetsPerShare: assetsPerShare }
}

export async function getAssetAndValueByVaults({ addresses, client }: { addresses: Address[], client: PublicClient }): Promise<AssetAndValue[]> {
  const res = await client.multicall({ contracts: addresses.map(address => prepareContract(address)).flat(), allowFailure: false })
  return addresses.map((address, i) => {
    if (i > 0) i = i *3
    return prepareResult({ vault: address, asset: res[i] as Address, totalAssets: Number(res[i + 1]), totalSupply: Number(res[i + 2]) })
  })
}

export default async function getAssetAndValueByVault({ address, client }: { address: Address, client: PublicClient }): Promise<AssetAndValue> {
  const res = await client.multicall({ contracts: prepareContract(address), allowFailure: false })
  return prepareResult({ vault: address, asset: res[0] as Address, totalAssets: Number(res[1]), totalSupply: Number(res[2]) })
}