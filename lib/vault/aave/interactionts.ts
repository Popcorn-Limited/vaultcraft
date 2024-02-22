import { showLoadingToast } from "@/lib/toasts";
import {
  Clients,
  ReserveData,
  ReserveDataResponse,
  SimulationResponse,
  Token,
  UserAccountData,
  VaultData
} from "@/lib/types";
import { VaultAbi } from "@/lib/constants";
import { Address, Chain, createPublicClient, formatUnits, getAddress, http, PublicClient, zeroAddress } from "viem";
import { handleCallResult } from "@/lib/utils/helpers";
import { FireEventArgs } from "@masa-finance/analytics-sdk";
import { RPC_URLS, networkMap } from "@/lib/utils/connectors";
import { AavePoolAbi, AavePoolUiAbi } from "@/lib/constants/abi/Aave";
import axios from "axios"
import { erc20ABI } from "wagmi";
import { AAVE_UI_DATA_PROVIDER } from "@/lib/vault/aave/handleVaultInteraction";

interface VaultWriteProps {
  chainId: number;
  vaultData: VaultData;
  account: Address;
  amount: number;
  clients: Clients;
  fireEvent?: (type: string, { user_address, network, contract_address, asset_amount, asset_ticker, additionalEventData }: FireEventArgs) => Promise<void>;
  referral?: Address;
}

interface AavePoolProps {
  asset?: Address;
  amount?: number;
  onBehalfOf?: Address;
  referralCode?: number;
  chainId?: number;
  account: Address
  clients: Clients
}

interface VaultRouterWriteProps extends VaultWriteProps {
  router: Address;
}

interface BaseSimulateProps {
  address: Address;
  account: Address;
  functionName: string;
  publicClient: PublicClient;
}

interface VaultSimulateProps extends BaseSimulateProps {
  args: any[];
}

interface AavePoolSimulateProps extends BaseSimulateProps {
  args: any[];
}

interface VaultRouterSimulateProps extends BaseSimulateProps {
  amount: number;
  vault: Address;
  gauge: Address;
}

async function simulateVaultCall({ address, account, args, functionName, publicClient }: VaultSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: VaultAbi,
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


export async function vaultDeposit({ chainId, vaultData, account, amount, clients, fireEvent, referral }: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Depositing into the vault...")

  const success = await handleCallResult({
    successMessage: "Deposited into the vault!",
    simulationResponse: await simulateVaultCall({
      address: vaultData.address,
      account,
      // @dev Since numbers get converted to strings like 1e+21 or similar we need to convert it back to numbers like 10000000000000 and than cast them into BigInts
      args: [BigInt(Number(amount).toLocaleString("fullwide", { useGrouping: false })), account],
      functionName: "deposit",
      publicClient: clients.publicClient
    }),
    clients
  })

  if (success && fireEvent) {
    void fireEvent("addLiquidity", {
      user_address: account,
      network: networkMap[chainId].toLowerCase(),
      contract_address: vaultData.address,
      asset_amount: String(amount / (10 ** vaultData.asset.decimals)),
      asset_ticker: vaultData.asset.symbol,
      additionalEventData: {
        referral: referral,
        vault_name: vaultData.metadata.vaultName
      }
    });
  }
  return success
}


export async function supplyToAave({ asset, amount, onBehalfOf, chainId, account, clients }: AavePoolProps): Promise<boolean> {
  showLoadingToast("Supplying to Aave...")

  return await handleCallResult({
    successMessage: "Supplied underlying asset into Aave pool!",
    simulationResponse: await simulateAavePoolCall({
      address: AAVE_UI_DATA_PROVIDER,
      account,
      args: [asset, amount, onBehalfOf, 0],
      functionName: "supply",
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
      address: AAVE_UI_DATA_PROVIDER,
      account,
      args: [asset, amount, 2, 0, onBehalfOf],
      functionName: "borrow",
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

  let result = reserveData[0].filter(d => d.isActive).map(d => {
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