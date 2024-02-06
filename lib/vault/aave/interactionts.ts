import {showLoadingToast} from "@/lib/toasts";
import {
  Clients,
  ReserveData,
  ReserveDataResponse,
  SimulationResponse,
  Token,
  UserAccountData,
  VaultData
} from "@/lib/types";
import {VaultAbi} from "@/lib/constants";
import {Address, formatUnits, PublicClient} from "viem";
import {handleCallResult} from "@/lib/utils/helpers";
import {FireEventArgs} from "@masa-finance/analytics-sdk";
import {networkMap} from "@/lib/utils/connectors";
import {AavePoolAbi} from "@/lib/constants/abi/Aave";
import axios from "axios"
import {erc20ABI} from "wagmi";
import {AAVE_POOL_PROXY} from "@/lib/vault/aave/handleVaultInteraction";

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


export async function supplyToAave({ asset, amount, onBehalfOf, chainId, account,  clients }: AavePoolProps): Promise<boolean> {
  showLoadingToast("Supplying to Aave...")

  return await handleCallResult({
    successMessage: "Supplied underlying asset into Aave pool!",
    simulationResponse: await simulateAavePoolCall({
      address: AAVE_POOL_PROXY,
      account,
      args:[asset, amount, onBehalfOf, 0],
      functionName: "supply",
      publicClient: clients.publicClient
    }),
    clients
  })
}

export async function borrowFromAave({ asset, amount, onBehalfOf, chainId, account,  clients }: AavePoolProps): Promise<boolean> {
  showLoadingToast("Borrowing from Aave...")

  return await handleCallResult({
    successMessage: "Borrowed underlying asset from Aave pool!",
    simulationResponse: await simulateAavePoolCall({
      address: AAVE_POOL_PROXY,
      account,
      args:[asset, amount, 2, 0, onBehalfOf],
      functionName: "borrow",
      publicClient: clients.publicClient
    }),
    clients
  })
}

interface Tokens {
  DAI: Token;
  USDC: Token;
  USDT: Token;
  BAL: Token;
}
export async function fetchTokens(account: Address, tokens: Tokens, publicClient: PublicClient) {
  const {data: llamaPrices} = await axios.get("https://coins.llama.fi/prices/current/ethereum:0x6B175474E89094C44Da98b954EedeAC495271d0F,"
    + "ethereum:0xA35b1B31Ce002FBF2058D22F30f95D405200A15b,"
    + "ethereum:0xdAC17F958D2ee523a2206206994597C13D831ec7,"
    + "ethereum:0xba100000625a3754423978a60c9317c58a424e3D"
  )

  const {DAI, USDC, USDT, BAL} = tokens;
  console.log(publicClient.chain, publicClient)
  const balRes = await publicClient.multicall({
    contracts: [
      {
        address: DAI.address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [account]
      },
      {
        address: USDC.address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [account]
      },
      {
        address: USDT.address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [account]
      },
      {
        address: BAL.address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [account]
      }
    ],
    allowFailure: false
  }) as bigint[]

  return {
    dai: {
      ...DAI,
      price: llamaPrices.coins["ethereum:0x6B175474E89094C44Da98b954EedeAC495271d0F"].price,
      balance: Number(balRes[0])
    },
    usdc: {
      ...USDC,
      price: llamaPrices.coins["ethereum:0xA35b1B31Ce002FBF2058D22F30f95D405200A15b"].price,
      balance: Number(balRes[1])
    },
    usdt: {
      ...USDT,
      price: llamaPrices.coins["ethereum:0xdAC17F958D2ee523a2206206994597C13D831ec7"].price,
      balance: Number(balRes[2])
    },
    bal: {
      ...BAL,
      price: llamaPrices.coins["ethereum:0xba100000625a3754423978a60c9317c58a424e3D"].price,
      balance: Number(balRes[3])
    }
  }
}


export async function fetchUserAccountData(account: Address, publicClient: PublicClient): Promise<UserAccountData> {
  const userData = await publicClient.readContract({
    address: AAVE_POOL_PROXY,
    abi: AavePoolAbi,
    functionName: 'getUserAccountData',
    args: [account],
  }) as bigint[]

  return {
    availableBorrowsBase: Number(userData[2]),
    currentLiquidationThreshold: Number(userData[3]),
    healthFactor: Number(userData[5]),
    ltv: Number(userData[4]),
    totalCollateralBase: Number(userData[0]),
    totalDebtBase: Number(userData[1])
  }
}

export async function fetchReserveData(asset: Address, publicClient: PublicClient): Promise<ReserveData> {
  const reserveData = await publicClient.readContract({
    address: AAVE_POOL_PROXY,
    abi: AavePoolAbi,
    functionName: 'getReserveData',
    args: [asset],
  }) as ReserveDataResponse

  // Convert rates from ray to more readable format (e.g., percent per year)
  // Note: Aave uses ray encoding for rates, which is a 27-decimal fixed point representation
  const variableBorrowRate = Number(formatUnits(reserveData.currentVariableBorrowRate, 27)) * 100; // Convert to percentage
  const stableBorrowRate = Number(formatUnits(reserveData.currentStableBorrowRate, 27)) * 100; // Convert to percentage
  const liquidityRate = Number(formatUnits(reserveData.currentLiquidityRate, 27)) * 100;

  return {
    variableBorrowRate,
    stableBorrowRate,
    liquidityRate
  }
}
