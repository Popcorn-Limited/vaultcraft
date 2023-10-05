import { MAX_INT256, MAX_UINT256, ZERO } from "@/lib/constants";
import { balancerApiProxyCall } from "@/lib/external/balancer/router/call";
import { BatchSwapStep } from "@/lib/external/balancer/router/interfaces";
import { Address, encodeAbiParameters, getAddress, parseUnits } from "viem";
import { PublicClient } from "wagmi";
import { StrategyEncodingResolverParams } from "..";

interface BalancerRoute {
  swaps: BatchSwapStep[];
  assets: Address[];
  limits: BigInt[]
}

const toAssetRoute: BalancerRoute = {
  swaps: [],
  assets: [],
  limits: [],
}

const BALANCER_VAULT: { [key: number]: Address } = { 1: "0xBA12222222228d8Ba445958a75a0704d566BF2C8" }

async function createRoute(sellToken: Address, buyToken: Address, chainId: number, client: PublicClient, gasPrice: string | null | undefined): Promise<BalancerRoute> {
  const decimals = await client.readContract({
    address: sellToken,
    abi: tokenDecimalsAbi,
    functionName: "decimals"
  })

  const res = await balancerApiProxyCall({
    sellToken: sellToken,
    buyToken: buyToken,
    orderKind: "sell",
    amount: parseUnits("1", decimals).toString(),
    gasPrice: gasPrice || parseUnits("1", 9).toString()
  });

  const route: BalancerRoute = {
    swaps: res.swaps.map((swap, i) => {
      return {
        poolId: swap.poolId,
        assetInIndex: BigInt(String(swap.assetInIndex)),
        assetOutIndex: BigInt(String(swap.assetOutIndex)),
        amount: i === 0 ? BigInt("1") : ZERO,
        userData: swap.userData === "0x" ? "" : swap.userData
      }
    }),
    assets: res.tokenAddresses.map(address => getAddress(address)),
    limits: res.tokenAddresses.map((address, i) => i < (res.tokenAddresses.length - 1) ? MAX_INT256 : BigInt("-1"))
  }

  return route
}

export async function balancerLpCompounder({ chainId, client, address, params }: StrategyEncodingResolverParams): Promise<string> {
  const route1 = await createRoute(params[0][0], params[2], chainId, client, parseUnits("1", 9).toString()) // TODO - fetch gas price dynamically
  const values = [route1]

  if (params[0].length == 2) {
    const route2 = await createRoute(params[0][0], params[2], chainId, client, parseUnits("1", 9).toString()) // TODO - fetch gas price dynamically
    values.push(route2)
  }

  return encodeAbiParameters(encodeAbi,
    [
      params[2] as Address, // baseAsset
      BALANCER_VAULT[chainId], // vault
      // @ts-ignore
      values, // toBaseAssetRoute
      // @ts-ignore
      toAssetRoute,
      params[1].map((value: string) => "0" ? MAX_UINT256 : BigInt(value)), // minTradeAmounts
      encodeAbiParameters(balancerOptionalDataAbi, params[3])
    ]);
}

const balancerOptionalDataAbi = [{ name: 'poolId', type: 'bytes32' }, { name: 'indexIn', type: 'uint8' }] as const

const baseAssetAbi = { name: 'baseAsset', type: 'address' } as const
const vaultAbi = { name: 'vault', type: 'address' } as const
const toBaseAssetRouteAbi = {
  "internalType": "struct BalancerRoute[]",
  "name": "_toAssetRoute",
  "type": "tuple[]",
  "components": [
    {
      "components": [
        {
          "internalType": "bytes32",
          "name": "poolId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "assetInIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "assetOutIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "internalType": "struct BatchSwapStep[]",
      "name": "swaps",
      "type": "tuple[]"
    },
    {
      "internalType": "contract IAsset[]",
      "name": "assets",
      "type": "address[]"
    },
    {
      "internalType": "int256[]",
      "name": "limits",
      "type": "int256[]"
    },
  ]
} as const;
const toAssetRouteAbi = {
  "internalType": "struct BalancerRoute",
  "name": "_toAssetRoute",
  "type": "tuple",
  "components": [
    {
      "components": [
        {
          "internalType": "bytes32",
          "name": "poolId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "assetInIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "assetOutIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "userData",
          "type": "bytes"
        }
      ],
      "internalType": "struct BatchSwapStep[]",
      "name": "swaps",
      "type": "tuple[]"
    },
    {
      "internalType": "contract IAsset[]",
      "name": "assets",
      "type": "address[]"
    },
    {
      "internalType": "int256[]",
      "name": "limits",
      "type": "int256[]"
    },
  ]
} as const;
const minAmountOutAbi = { name: 'numbers', type: 'uint256[]' } as const
const optionalDataAbi = { name: 'optionalData', type: 'bytes' } as const
const encodeAbi = [baseAssetAbi, vaultAbi, toBaseAssetRouteAbi, toAssetRouteAbi, minAmountOutAbi, optionalDataAbi] as const

const tokenDecimalsAbi = [
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }] as const


