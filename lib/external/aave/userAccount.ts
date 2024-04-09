import { ReserveData, TokenByAddress, UserAccountData } from "@/lib/types"
import { RPC_URLS } from "@/lib/utils/connectors"
import { Address, Chain, createPublicClient, formatUnits, http, zeroAddress } from "viem"
import { AavePoolAddressProviderByChain, AavePoolByChain, AaveUiPoolProviderByChain } from "."
import { AavePoolAbi, AavePoolUiAbi } from "@/lib/constants/abi/Aave"

const secondsPerYear = 31536000

export async function fetchAaveReserveData(account: Address, tokens: TokenByAddress, chain: Chain): Promise<ReserveData[]> {
  const client = createPublicClient({ chain, transport: http(RPC_URLS[chain.id]) })

  const userData = await client.readContract({
    address: AaveUiPoolProviderByChain[chain.id],
    abi: AavePoolUiAbi,
    functionName: 'getUserReservesData',
    args: [AavePoolAddressProviderByChain[chain.id], account === zeroAddress ? AavePoolAddressProviderByChain[chain.id] : account],
  })
  const reserveData = await client.readContract({
    address: AaveUiPoolProviderByChain[chain.id],
    abi: AavePoolUiAbi,
    functionName: 'getReservesData',
    args: [AavePoolAddressProviderByChain[chain.id]],
  })

  let result = reserveData[0].filter(d => !d.isFrozen).map(d => {
    const uData = userData[0].find(e => e.underlyingAsset === d.underlyingAsset)
    const decimals = Number(d.decimals)

    const supplyAmount = account === zeroAddress ? 0 : Number(formatUnits(uData?.scaledATokenBalance || BigInt(0), decimals)) * Number(formatUnits(d.liquidityIndex, 27))
    const borrowAmount = account === zeroAddress ? 0 : Number(formatUnits(uData?.scaledVariableDebt || BigInt(0), decimals))
    return {
      ltv: Number(d.baseLTVasCollateral) / 100,
      liquidationThreshold: Number(d.reserveLiquidationThreshold) / 100,
      liquidationPenalty: (Number(d.reserveLiquidationBonus) - 10000) / 100,
      supplyRate: (((1 + (Number(formatUnits(d.liquidityRate, 27)) / secondsPerYear)) ** secondsPerYear) - 1) * 100,
      borrowRate: (((1 + (Number(formatUnits(d.variableBorrowRate, 27)) / secondsPerYear)) ** secondsPerYear) - 1) * 100,
      asset: d.underlyingAsset,
      supplyAmount: supplyAmount,
      borrowAmount: borrowAmount,
      supplyValue: supplyAmount * tokens[d.underlyingAsset].price,
      borrowValue: borrowAmount * tokens[d.underlyingAsset].price,
      balance: tokens[d.underlyingAsset].balance,
      balanceValue: tokens[d.underlyingAsset].balance * tokens[d.underlyingAsset].price,
      supplyBalance: account === zeroAddress ? 0 : Math.floor(Number(formatUnits(uData?.scaledATokenBalance || BigInt(0), decimals)) * Number(formatUnits(d.liquidityIndex, 27)) * (10 ** decimals))
    }
  })

  return result
}

export async function fetchAaveData(account: Address, tokens: TokenByAddress, chain: Chain): Promise<{ reserveData: ReserveData[], userAccountData: UserAccountData }> {
  const reserveData = await fetchAaveReserveData(account || zeroAddress, tokens, chain);

  const client = createPublicClient({ chain, transport: http(RPC_URLS[chain.id]) })
  const accountData = await client.readContract({
    address: AavePoolByChain[chain.id],
    abi: AavePoolAbi,
    functionName: 'getUserAccountData',
    args: [account || zeroAddress],
  })
  return { reserveData, userAccountData: calcUserAccountData(reserveData, tokens, (Number(accountData[3]) / 10_000)) }
}

export function calcUserAccountData(reserveData: ReserveData[], tokens: TokenByAddress, ltv: number): UserAccountData {
  const totalCollateral = reserveData.map(r => r.supplyAmount * tokens[r.asset].price).reduce((a, b) => a + b, 0);
  const totalBorrowed = reserveData.map(r => r.borrowAmount * tokens[r.asset].price).reduce((a, b) => a + b, 0);
  const netValue = totalCollateral - totalBorrowed;

  const totalSupplyRate = reserveData.map(r => r.supplyAmount * tokens[r.asset].price * r.supplyRate).reduce((a, b) => a + b, 0);
  const totalBorrowRate = reserveData.map(r => r.borrowAmount * tokens[r.asset].price * r.borrowRate).reduce((a, b) => a + b, 0);
  const netRate = (totalSupplyRate - totalBorrowRate) / totalCollateral

  const healthFactor = (totalCollateral * ltv) / totalBorrowed;
  return { totalCollateral, totalBorrowed, netValue, totalSupplyRate, totalBorrowRate, netRate, ltv, healthFactor }
}