import { showLoadingToast } from "@/lib/toasts";
import {
  Clients,
  ReserveData,
  SimulationResponse,
  UserAccountData,
} from "@/lib/types";
import { Address, Chain, createPublicClient, formatUnits, getAddress, http, PublicClient, zeroAddress } from "viem";
import { handleCallResult } from "@/lib/utils/helpers";
import { RPC_URLS, networkMap } from "@/lib/utils/connectors";
import { AavePoolAbi, AavePoolUiAbi } from "@/lib/constants/abi/Aave";
import axios from "axios"
import { erc20ABI } from "wagmi";

export const AAVE_POOL = "0x794a61358D6845594F94dc1DB02A252b5b4814aD" //OPTIMISM
export const AAVE_UI_DATA_PROVIDER = "0xbd83DdBE37fc91923d59C8c1E0bDe0CccCa332d5"; //OPTIMISM

interface AavePoolProps {
  asset?: Address;
  amount?: number;
  onBehalfOf?: Address;
  referralCode?: number;
  chainId?: number;
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
      address: AAVE_POOL,
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
      address: AAVE_POOL,
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
      address: AAVE_POOL,
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
      address: AAVE_POOL,
      account,
      args: [asset, amount, 2, 0, onBehalfOf],
      functionName: "repay",
      publicClient: clients.publicClient
    }),
    clients
  })
}

const secondsPerYear = 31536000

export async function fetchAaveData(account: Address, chain: Chain): Promise<ReserveData[]> {
  const client = createPublicClient({ chain, transport: http(RPC_URLS[chain.id]) })

  const userData = await client.readContract({
    address: AAVE_UI_DATA_PROVIDER,
    abi: AavePoolUiAbi,
    functionName: 'getUserReservesData',
    args: ["0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb", account === zeroAddress ? "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb" : account],
  })
  const reserveData = await client.readContract({
    address: AAVE_UI_DATA_PROVIDER,
    abi: AavePoolUiAbi,
    functionName: 'getReservesData',
    args: ["0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb"],
  })

  const { data: assets } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/assets/tokens/${chain.id}.json`)

  console.log({ reserveData })

  let result = reserveData[0].filter(d => !d.isFrozen).map(d => {
    const uData = userData[0].find(e => e.underlyingAsset === d.underlyingAsset)
    const decimals = Number(d.decimals)
    return {
      ltv: Number(d.baseLTVasCollateral) / 100,
      liquidationThreshold: Number(d.reserveLiquidationThreshold) / 100,
      liquidationPenalty: (Number(d.reserveLiquidationBonus) - 10000) / 100,
      supplyRate: (((1 + (Number(formatUnits(d.liquidityRate, 27)) / secondsPerYear)) ** secondsPerYear) - 1) * 100,
      borrowRate: (((1 + (Number(formatUnits(d.variableBorrowRate, 27)) / secondsPerYear)) ** secondsPerYear) - 1) * 100,
      asset: assets[getAddress(d.underlyingAsset)],
      supplyAmount: account === zeroAddress ? 0 : Number(formatUnits(uData?.scaledATokenBalance || BigInt(0), decimals)) * Number(formatUnits(d.liquidityIndex, 27)),
      borrowAmount: account === zeroAddress ? 0 : Number(formatUnits(uData?.scaledVariableDebt || BigInt(0), decimals)),
      balance: account === zeroAddress ? 0 : Number(uData?.scaledATokenBalance)
    }
  })

  const { data: priceData } = await axios.get(`https://coins.llama.fi/prices/current/${String(result.map(
    e => `${networkMap[chain.id].toLowerCase()}:${e.asset.address}`
  ))}`)

  result.forEach((e, i) => {
    e.asset.balance = 0;
    e.asset.price = Number(priceData.coins[`${networkMap[chain.id].toLowerCase()}:${e.asset.address}`]?.price);
  })

  if (account !== zeroAddress) {
    const bals = await client.multicall({
      contracts: result.map((e: any) => {
        return {
          address: e.asset.address,
          abi: erc20ABI,
          functionName: 'balanceOf',
          args: [account]
        }
      }),
      allowFailure: false
    })
    result.forEach((e, i) => {
      e.asset.balance = Number(bals[i])
    })
  }

  return result
}

export function calcUserAccountData(reserveData: ReserveData[], ltv: number): UserAccountData {
  const totalCollateral = reserveData.map(r => r.supplyAmount * r.asset.price).reduce((a, b) => a + b, 0);
  const totalBorrowed = reserveData.map(r => r.borrowAmount * r.asset.price).reduce((a, b) => a + b, 0);
  const netValue = totalCollateral - totalBorrowed;

  const totalSupplyRate = reserveData.map(r => r.supplyAmount * r.asset.price * (r.supplyRate / 100)).reduce((a, b) => a + b, 0);
  const totalBorrowRate = reserveData.map(r => r.borrowAmount * r.asset.price * (r.borrowAmount / 100)).reduce((a, b) => a + b, 0);
  const netRate = (totalSupplyRate - totalBorrowRate) / netValue

  const healthFactor = (totalCollateral * ltv) / totalBorrowed;
  return { totalCollateral, totalBorrowed, netValue, totalSupplyRate, totalBorrowRate, netRate, ltv, healthFactor }
}