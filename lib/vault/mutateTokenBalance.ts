import { Address, PublicClient } from "viem";
import { erc20ABI } from "wagmi";
import { VaultAbi } from "@/lib/constants";
import { LockVaultData, Token, VaultData } from "@/lib/types";

export interface MutateTokenBalanceProps {
  inputToken: Address;
  outputToken: Address;
  vault: Address;
  chainId: number;
  account: Address;
  zapAssetState: [{ [key: number]: Token[] }, Function],
  vaultsState: [VaultData[] | LockVaultData[], Function]
  publicClient: PublicClient;
}

const NETWORKS_SUPPORTING_ZAP = [1, 137, 10, 42161, 56]

export default async function mutateTokenBalance({ inputToken, outputToken, vault, chainId, account, zapAssetState, vaultsState, publicClient }: MutateTokenBalanceProps) {
  const [zapAssets, setZapAssets] = zapAssetState;
  const [vaults, setVaults] = vaultsState;

  const data = await publicClient.multicall({
    contracts: [
      {
        address: inputToken,
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [account]
      },
      {
        address: outputToken,
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [account]
      },
      {
        address: vault,
        abi: VaultAbi,
        functionName: 'totalAssets'
      },
      {
        address: vault,
        abi: VaultAbi,
        functionName: 'totalSupply'
      }],
    allowFailure: false
  })

  // Modify zap assets
  if (NETWORKS_SUPPORTING_ZAP.includes(chainId)) {
    const zapAssetFound = zapAssets[chainId].find(asset => asset.address === inputToken || asset.address === outputToken) // @dev -- might need to copy the state here already to avoid modifing a pointer
    if (zapAssetFound) {
      zapAssetFound.balance = zapAssetFound.address === inputToken ? Number(data[0]) : Number(data[1])
      setZapAssets({ ...zapAssets, [chainId]: [...zapAssets[chainId], zapAssetFound] })
    }
  }

  // Modify vaults, assets and gauges
  const newVaultState: VaultData[] = [...vaults]
  newVaultState.forEach(vaultData => {
    if (vaultData.chainId === chainId) {
      // Modify vault pricing and tvl
      if (vaultData.address === vault) {
        const assetsPerShare = Number(data[3]) > 0 ? Number(data[2]) / Number(data[3]) : Number(1e-9)
        const pricePerShare = assetsPerShare * vaultData.assetPrice

        vaultData.totalAssets = Number(data[2])
        vaultData.totalSupply = Number(data[3])
        vaultData.assetsPerShare = assetsPerShare
        vaultData.pricePerShare = pricePerShare
        vaultData.tvl = (Number(data[3]) * pricePerShare) / (10 ** vaultData.asset.decimals)
        vaultData.vault.price = pricePerShare * 1e9

        if (vaultData.gauge) vaultData.gauge.price = pricePerShare * 1e9
      }
      // Adjust vault balance
      if (vaultData.vault.address === inputToken || vaultData.vault.address === outputToken) {
        vaultData.vault.balance = vaultData.vault.address === inputToken ? Number(data[0]) : Number(data[1])
      }
      // Adjust asset balance
      if (vaultData.asset.address === inputToken || vaultData.asset.address === outputToken) {
        vaultData.asset.balance = vaultData.asset.address === inputToken ? Number(data[0]) : Number(data[1])
      }
      // Adjust gauge balance
      if (vaultData.gauge?.address === inputToken || vaultData.gauge?.address === outputToken) {
        vaultData.gauge.balance = vaultData.gauge.address === inputToken ? Number(data[0]) : Number(data[1])
      }
    }
  })
  setVaults(newVaultState)
}