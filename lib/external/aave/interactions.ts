import { showLoadingToast } from "@/lib/toasts";
import {
  AddressByChain,
  Clients,
  ReserveData,
  SimulationResponse,
  Token,
  TokenByAddress,
  UserAccountData,
} from "@/lib/types";
import { Address, Chain, createPublicClient, formatUnits, getAddress, http, maxUint256, PublicClient, zeroAddress } from "viem";
import { handleCallResult } from "@/lib/utils/helpers";
import { RPC_URLS, networkMap } from "@/lib/utils/connectors";
import { AavePoolAbi, AavePoolUiAbi } from "@/lib/constants/abi/Aave";
import axios from "axios"
import { erc20ABI } from "wagmi";

export const AavePoolByChain: AddressByChain = {
  1: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
  137: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  10: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  42161: "0x794a61358D6845594F94dc1DB02A252b5b4814aD"
}
export const AaveUiPoolProviderByChain: AddressByChain = {
  1: "0x91c0eA31b49B69Ea18607702c5d9aC360bf3dE7d",
  137: "0xC69728f11E9E6127733751c8410432913123acf1",
  10: "0xbd83DdBE37fc91923d59C8c1E0bDe0CccCa332d5",
  42161: "0x145dE30c929a065582da84Cf96F88460dB9745A7"
}

export const AavePoolAddressProviderByChain: AddressByChain = {
  1: "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e",
  137: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
  10: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
  42161: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb"
}

interface AavePoolProps {
  asset: Address;
  amount: number;
  onBehalfOf: Address;
  chainId: number;
  account: Address
  clients: Clients
}

interface BaseSimulateProps {
  address: Address;
  account: Address;
  functionName: string;
  publicClient: PublicClient;
}

interface AavePoolSimulateProps extends BaseSimulateProps {
  args: any[];
}

async function simulateAavePoolCall({ address, account, args, functionName, publicClient }: AavePoolSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: AavePoolAbi,
      // @ts-ignore
      functionName,
      // @ts-ignore
      args
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}



export async function supplyToAave({ asset, amount, onBehalfOf, chainId, account, clients }: AavePoolProps): Promise<boolean> {
  showLoadingToast("Supplying to Aave...")

  return await handleCallResult({
    successMessage: "Supplied underlying asset into Aave pool!",
    simulationResponse: await simulateAavePoolCall({
      address: AavePoolByChain[chainId],
      account,
      args: [asset, amount, onBehalfOf, 0],
      functionName: "supply",
      publicClient: clients.publicClient
    }),
    clients
  })
}

export async function withdrawFromAave({ asset, amount, onBehalfOf, chainId, account, clients }: AavePoolProps): Promise<boolean> {
  showLoadingToast("Withdrawing from Aave...")

  return await handleCallResult({
    successMessage: "Withdrew underlying asset from Aave pool!",
    simulationResponse: await simulateAavePoolCall({
      address: AavePoolByChain[chainId],
      account,
      args: [asset, amount, onBehalfOf],
      functionName: "withdraw",
      publicClient: clients.publicClient
    }),
    clients
  })
}

export async function borrowFromAave({ asset, amount, onBehalfOf, chainId, account, clients }: AavePoolProps): Promise<boolean> {
  showLoadingToast("Borrowing from Aave...")

  return await handleCallResult({
    successMessage: "Borrowed underlying asset from Aave pool!",
    simulationResponse: await simulateAavePoolCall({
      address: AavePoolByChain[chainId],
      account,
      args: [asset, amount, 2, 0, onBehalfOf],
      functionName: "borrow",
      publicClient: clients.publicClient
    }),
    clients
  })
}

export async function repayToAave({ asset, amount, onBehalfOf, chainId, account, clients }: AavePoolProps): Promise<boolean> {
  showLoadingToast("Repaying Aave...")

  return await handleCallResult({
    successMessage: "Repayed underlying asset for Aave pool!",
    simulationResponse: await simulateAavePoolCall({
      address: AavePoolByChain[chainId],
      account,
      args: [asset, amount === Number(maxUint256) ? -1 : amount, 2, onBehalfOf],
      functionName: "repay",
      publicClient: clients.publicClient
    }),
    clients
  })
}

const secondsPerYear = 31536000

export async function fetchAaveReserveData(account: Address, chain: Chain): Promise<ReserveData[]> {
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
    return {
      ltv: Number(d.baseLTVasCollateral) / 100,
      liquidationThreshold: Number(d.reserveLiquidationThreshold) / 100,
      liquidationPenalty: (Number(d.reserveLiquidationBonus) - 10000) / 100,
      supplyRate: (((1 + (Number(formatUnits(d.liquidityRate, 27)) / secondsPerYear)) ** secondsPerYear) - 1) * 100,
      borrowRate: (((1 + (Number(formatUnits(d.variableBorrowRate, 27)) / secondsPerYear)) ** secondsPerYear) - 1) * 100,
      asset: d.underlyingAsset,
      supplyAmount: account === zeroAddress ? 0 : Number(formatUnits(uData?.scaledATokenBalance || BigInt(0), decimals)) * Number(formatUnits(d.liquidityIndex, 27)),
      borrowAmount: account === zeroAddress ? 0 : Number(formatUnits(uData?.scaledVariableDebt || BigInt(0), decimals)),
      balance: account === zeroAddress ? 0 : Math.floor(Number(formatUnits(uData?.scaledATokenBalance || BigInt(0), decimals)) * Number(formatUnits(d.liquidityIndex, 27)) * (10 ** decimals))
    }
  })

  return result
}

export async function fetchAaveData(account: Address, tokens: TokenByAddress, chain: Chain): Promise<{ reserveData: ReserveData[], userAccountData: UserAccountData }> {
  const reserveData = await fetchAaveReserveData(account || zeroAddress, chain);

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