import { PublicClient, createPublicClient, http } from "viem";
import { Chain, arbitrum, optimism, polygon } from "viem/chains";
import { Address, mainnet } from "wagmi";
import { ChainId, RPC_URLS } from "@/lib/utils/connectors";
import { ERC20Abi, PopByChain, PopStakingByChain } from "@/lib/constants";
import { resolvePrice } from "@/lib/resolver/price/price";
import { VaultData } from "./types";

const BaseAddressesByChain: { [key: number]: Address[] } = {
  1: [PopByChain[ChainId.Ethereum], PopStakingByChain[ChainId.Ethereum]],
  137: [PopByChain[ChainId.Polygon], PopStakingByChain[ChainId.Polygon]],
  10: [PopByChain[ChainId.Optimism], PopStakingByChain[ChainId.Optimism]],
  42161: []
}

type TotalNetworth = {
  [key: number]: Networth,
  total: Networth
}

export type Networth = {
  pop: number,
  stake: number,
  vault: number,
  total: number
}

export function getVaultNetworthByChain({ vaults, chainId }: { vaults: VaultData[], chainId: number }): number {
  const vaultValue = vaults.filter(vaultData => vaultData.chainId === chainId).map(vaultData => (vaultData.vault.balance * vaultData.vault.price) / (10 ** vaultData.vault.decimals)).reduce((a, b) => a + b, 0)
  const gaugeValue = vaults.filter(
    vaultData => vaultData.chainId === chainId && !!vaultData.gauge?.address)
    .map(vaultData => ((vaultData.gauge?.balance || 0) * (vaultData.gauge?.price || 0)) / (10 ** (vaultData.gauge?.decimals || 0))).reduce((a, b) => a + b, 0)
  return vaultValue + gaugeValue
}

async function getBalancesByChain({ account, client, addresses }: { account: Address, client: PublicClient, addresses: Address[] })
  : Promise<{ address: Address, balance: number, decimals: number }[]> {
  let res = await client.multicall({
    contracts: addresses.map((address) => {
      return [{
        address,
        abi: ERC20Abi,
        functionName: 'balanceOf',
        args: [account]
      }, {
        address,
        abi: ERC20Abi,
        functionName: 'decimals'
      }]
    }).flat(),
    allowFailure: false
  })

  const bals = addresses.map((address, i) => {
    if (i > 0) i = i * 2
    const bal = Number(res[i])
    if (bal === 0) return { address: address, balance: 0, decimals: Number(res[i + 1]) }
    return { address: address, balance: Number(bal), decimals: Number(res[i + 1]) }
  })
  return bals
}

export async function getNetworthByChain({ account, chain }: { account: Address, chain: Chain }): Promise<Networth> {
  const client = createPublicClient({
    chain,
    transport: http(RPC_URLS[chain.id])
  })

  // Get balances
  const balances = await getBalancesByChain({ account, client, addresses: BaseAddressesByChain[client.chain?.id as number] })

  // Get value of VCX holdings
  const popPrice = await resolvePrice({ address: PopByChain[10], chainId: 10, client: undefined, resolver: 'llama' })
  const popNetworth = ((balances.find(entry => entry.address === PopByChain[chain.id])?.balance || 0) * popPrice) / (1e18);
  const stakeNetworth = ((balances.find(entry => entry.address === PopStakingByChain[chain.id])?.balance || 0) * popPrice) / (1e18);

  return { pop: popNetworth, stake: stakeNetworth, vault: 0, total: popNetworth + stakeNetworth }
}

export async function getTotalNetworth({ account }: { account: Address }): Promise<TotalNetworth> {
  const ethereumNetworth = await getNetworthByChain({ account, chain: mainnet })
  const polygonNetworth = await getNetworthByChain({ account, chain: polygon })
  const optimismNetworth = await getNetworthByChain({ account, chain: optimism })
  const arbitrumNetworth = await getNetworthByChain({ account, chain: arbitrum })

  return {
    [ChainId.Ethereum]: ethereumNetworth,
    [ChainId.Polygon]: polygonNetworth,
    [ChainId.Optimism]: optimismNetworth,
    [ChainId.Arbitrum]: arbitrumNetworth,
    total: {
      pop: ethereumNetworth.pop + polygonNetworth.pop + optimismNetworth.pop + arbitrumNetworth.pop,
      stake: ethereumNetworth.stake + polygonNetworth.stake + optimismNetworth.stake + arbitrumNetworth.stake,
      vault: 0,
      total: ethereumNetworth.total + polygonNetworth.total + optimismNetworth.total + arbitrumNetworth.total
    }
  }
}

