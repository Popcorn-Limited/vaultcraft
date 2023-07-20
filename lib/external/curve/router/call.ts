import { IRoute, CurveRoute } from "@/lib/external/curve/router/interfaces";
import curve from '@curvefi/api'
import { BigNumber, constants, ethers } from "ethers";

const EMPTY_ROUTE = [constants.AddressZero, constants.AddressZero, constants.AddressZero, constants.AddressZero, constants.AddressZero, constants.AddressZero, constants.AddressZero, constants.AddressZero, constants.AddressZero]

const EMPTY_SWAP_PARAMS = [
    [BigNumber.from(0), BigNumber.from(0), BigNumber.from(0)],
    [BigNumber.from(0), BigNumber.from(0), BigNumber.from(0)],
    [BigNumber.from(0), BigNumber.from(0), BigNumber.from(0)],
    [BigNumber.from(0), BigNumber.from(0), BigNumber.from(0)]
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
    const swapParams: BigNumber[][] = [];
    for (let i = 0; i < route.length; i++) {
        swapParams[i] = [BigNumber.from(route[i].i), BigNumber.from(route[i].j), BigNumber.from(route[i].swapType)];
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
            routeSteps.push(constants.AddressZero)
        }
    }
    if (swapParams.length < 4) {
        const addEmptySwapParams = 4 - swapParams.length;
        for (let i = swapParams.length; i < addEmptySwapParams; i++) {
            swapParams[i] = [BigNumber.from(0), BigNumber.from(0), BigNumber.from(0)];
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
    minTradeAmounts: BigNumber[],
    optionalData: string
}): Promise<{ baseAsset: string, router: string, toBaseAssetRoutes: CurveRoute[], toAssetRoute: CurveRoute, minTradeAmounts: BigNumber[], optionalData: string }> => {
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
    minTradeAmounts: BigNumber[],
    optionalData: string
}): Promise<string> => {
    const curveData = await curveApiCall({ depositAsset, rewardTokens, baseAsset, router, minTradeAmounts, optionalData });

    // Prepare the data for encoding.
    const values = [
        curveData.baseAsset,
        curveData.router,
        ...curveData.toBaseAssetRoutes.flatMap(route => [
            ...route.route,
            ...route.swapParams.flat()
        ]),
        ...curveData.toAssetRoute.route,
        ...curveData.toAssetRoute.swapParams.flat(),
        ...curveData.minTradeAmounts,
        curveData.optionalData
    ];

    const types = [
        'address',
        'address',
        ...curveData.toBaseAssetRoutes.flatMap(() => [
            ...new Array(9).fill('address'),
            ...new Array(12).fill('uint256'),
        ]),
        ...new Array(9).fill('address'),
        ...new Array(12).fill('uint256'),
        ...new Array(curveData.minTradeAmounts.length).fill('uint256'),
        'string'
    ];

    return ethers.utils.defaultAbiCoder.encode(types, values);
}