import { ADDRESS_ZERO, ZERO } from "@/lib/constants";
import { CurveRoute } from "@/lib/external/curve/router/interfaces";
import curve from '@curvefi/api'
import { IRoute } from "@curvefi/api/lib/interfaces";
import { encodeAbiParameters, parseAbiParameters } from "viem";

const EMPTY_ROUTE = [ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO, ADDRESS_ZERO]

const EMPTY_SWAP_PARAMS = [
    [ZERO, ZERO, ZERO],
    [ZERO, ZERO, ZERO],
    [ZERO, ZERO, ZERO],
    [ZERO, ZERO, ZERO]
]

const curveInit: () => Promise<void> = async () => {
    await curve.init("Alchemy", { network: "homestead", apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string }, { chainId: 1 });
    await curve.factory.fetchPools();
    await curve.crvUSDFactory.fetchPools();
    await curve.EYWAFactory.fetchPools();
    await curve.cryptoFactory.fetchPools();
    await curve.tricryptoFactory.fetchPools();
}

function processRoute(route: IRoute): CurveRoute {
    const routeSteps: string[] = [];
    const swapParams: BigInt[][] = [];
    for (let i = 0; i < route.length; i++) {
        swapParams[i] = [BigInt(route[i].swapParams[0]), BigInt(route[i].swapParams[1]), BigInt(route[i].swapParams[2])];
        if (i === 0) {
            routeSteps.push(route[i].inputCoinAddress);
            routeSteps.push(route[i].poolAddress);
            routeSteps.push(route[i].outputCoinAddress);
        } else {
            routeSteps.push(route[i].poolAddress);
            routeSteps.push(route[i].outputCoinAddress);
        }
    }
    if (routeSteps.length < 9) {
        const addZeroAddresses = 9 - routeSteps.length;
        for (let i = 0; i < addZeroAddresses; i++) {
            routeSteps.push(ADDRESS_ZERO)
        }
    }
    if (swapParams.length < 4) {
        const addEmptySwapParams = 4 - swapParams.length;
        for (let i = 0; i < addEmptySwapParams; i++) {
            swapParams.push([ZERO, ZERO, ZERO]);
        }
    }

    const curveRoute: CurveRoute = {
        route: routeSteps,
        swapParams: swapParams
    }
    return curveRoute;
}


export const curveApiCall = async ({
    depositAsset,
    rewardTokens,
    baseAsset,
    router,
    minTradeAmounts,
    optionalData
}: {
    depositAsset: string,
    rewardTokens: string[],
    baseAsset: string,
    router: string,
    minTradeAmounts: BigInt[],
    optionalData: string
}): Promise<{ baseAsset: string, router: string, toBaseAssetRoutes: CurveRoute[], toAssetRoute: CurveRoute, minTradeAmounts: BigInt[], optionalData: string }> => {
    if (rewardTokens.length !== minTradeAmounts.length) {
        throw new Error("rewardTokens and minTradeAmounts must be the same length");
    }

    await curveInit();

    const toBaseAssetRoutes: CurveRoute[] = [];
    for (let i = 0; i < rewardTokens.length; i++) {
        const inputToken = rewardTokens[i];
        const outputToken = baseAsset;
        const { route: rewardRoute, } = await curve.router.getBestRouteAndOutput(inputToken, outputToken, '100000000');
        const toBaseAssetRoute = processRoute(rewardRoute);
        toBaseAssetRoutes.push(toBaseAssetRoute);
    }

    let toAssetRoute;
    if (baseAsset.toLowerCase() !== depositAsset.toLowerCase()) {
        const { route: assetRoute, } = await curve.router.getBestRouteAndOutput(baseAsset, depositAsset, '100000000');
        toAssetRoute = processRoute(assetRoute);
    } else {
        // fill empty route
        toAssetRoute = {
            route: EMPTY_ROUTE,
            swapParams: EMPTY_SWAP_PARAMS
        }
    }

    return { baseAsset, router, toBaseAssetRoutes, toAssetRoute, minTradeAmounts, optionalData }
}


export const curveApiCallToBytes = async ({
    depositAsset,
    rewardTokens,
    baseAsset,
    router,
    minTradeAmounts,
    optionalData
}: {
    depositAsset: string,
    rewardTokens: string[],
    baseAsset: string,
    router: string,
    minTradeAmounts: BigInt[],
    optionalData: string
}): Promise<string> => {
    const curveData = await curveApiCall({ depositAsset, rewardTokens, baseAsset, router, minTradeAmounts, optionalData });

    // Prepare the data for encoding.
    const values = [
        curveData.baseAsset,
        curveData.router,
        curveData.toBaseAssetRoutes,
        curveData.toAssetRoute,
        curveData.minTradeAmounts,
        curveData.optionalData
    ];
    // @dev typescript cant infer the types of the encodeAbiParameters function since we are using a dynamic array of types
    // @ts-ignore
    return encodeAbiParameters(encodeAbi, values);
}

const baseAssetAbi = { name: 'baseAsset', type: 'address' } as const
const routerAbi = { name: 'router', type: 'address' } as const
const toBaseAssetRoutesAbi = {
    "components": [
        {
            "internalType": "address[9]",
            "name": "route",
            "type": "address[9]"
        },
        {
            "internalType": "uint256[3][4]",
            "name": "swapParams",
            "type": "uint256[3][4]"
        }
    ],
    "internalType": "struct CurveRoute[]",
    "name": "_toBaseAssetRoutes",
    "type": "tuple[]"
} as const
const toAssetRouteAbi = {
    "internalType": "struct CurveRoute",
    "name": "_toAssetRoute",
    "type": "tuple",
    "components": [
        {
            "internalType": "address[9]",
            "name": "route",
            "type": "address[9]"
        },
        {
            "internalType": "uint256[3][4]",
            "name": "swapParams",
            "type": "uint256[3][4]"
        }
    ]
} as const;
const minAmountOutAbi = { name: 'numbers', type: 'uint256[]' } as const
const optionalDataAbi = { name: 'optionalData', type: 'bytes' } as const

const encodeAbi = [baseAssetAbi, routerAbi, toBaseAssetRoutesAbi, toAssetRouteAbi, minAmountOutAbi, optionalDataAbi] as const
