import { findAllRoutes } from "@/lib/external/curve/router";
import { IDict, IPoolData, INativeToken, CHAIN_ID_TYPE, REFERENCE_ASSET_TYPE } from "@/lib/external/curve/router/interfaces";
import { PoolResponse } from "@/lib/external/curve/router/interfaces";
import axios from "axios";
import curve from '@curvefi/api'
import { constants } from "ethers";
import { AsyncStringStorage } from "jotai/vanilla/utils/atomWithStorage";

const curveInit: () => Promise<void> = async () => {
    await curve.init("Alchemy", { network: "homestead", apiKey: "KsuP431uPWKR3KFb-K_0MT1jcwpUnjAg" }, { chainId: 1 });
    await curve.factory.fetchPools();
    await curve.crvUSDFactory.fetchPools();
    await curve.EYWAFactory.fetchPools();
    await curve.cryptoFactory.fetchPools();
    await curve.tricryptoFactory.fetchPools();
}

// const routeReducer: (route: obj) => string[] = () => {

// }

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
    minTradeAmounts: number[],
    optionalData: string
}): Promise<any> => {
    if (rewardTokens.length !== minTradeAmounts.length) {
        throw new Error("rewardTokens and minTradeAmounts must be the same length");
    }

    await curveInit();

    const toBaseAssetRoutes: string[][] = [];
    for (let i = 0; i < rewardTokens.length; i++) {
        const inputToken = rewardTokens[i];
        const outputToken = baseAsset;
        const { route: rewardRoute, } = await curve.router.getBestRouteAndOutput(inputToken, outputToken, '1000000');
        // console.log("ROUTE", rewardRoute);
        const toBaseAssetRoute: string[] = [];
        for (let j = 0; j < rewardRoute.length; j++) {
            if (j === 0) {
                toBaseAssetRoute.push(rewardRoute[j].inputCoinAddress);
                toBaseAssetRoute.push(rewardRoute[j].poolAddress);
                toBaseAssetRoute.push(rewardRoute[j].outputCoinAddress);
            } else {
                toBaseAssetRoute.push(rewardRoute[j].poolAddress);
                toBaseAssetRoute.push(rewardRoute[j].outputCoinAddress);
            }
        }
        if (toBaseAssetRoute.length < 9) {
            const addZeroAddresses = 9 - toBaseAssetRoute.length;
            for (let j = 0; j < addZeroAddresses; j++) {
                toBaseAssetRoute.push(constants.AddressZero)
            }
        }
        toBaseAssetRoutes.push(toBaseAssetRoute);
    }

    console.log("toBaseAssetRoutes", toBaseAssetRoutes);

    const toAssetRoute: string[] = [];
    const { route: assetRoute, output } = await curve.router.getBestRouteAndOutput(baseAsset, depositAsset, '1000000');
    for (let i = 0; i < assetRoute.length; i++) {
        if (i === 0) {
            toAssetRoute.push(assetRoute[i].inputCoinAddress);
            toAssetRoute.push(assetRoute[i].poolAddress);
            toAssetRoute.push(assetRoute[i].outputCoinAddress);
        } else {
            toAssetRoute.push(assetRoute[i].poolAddress);
            toAssetRoute.push(assetRoute[i].outputCoinAddress);
        }
    }
    if (toAssetRoute.length < 9) {
        const addZeroAddresses = 9 - toAssetRoute.length;
        for (let i = 0; i < addZeroAddresses; i++) {
            toAssetRoute.push(constants.AddressZero)
        }
    }



    // console.log("PING", toDepositAssetRoute);
}

    // console.log("KEY", allPools[Object.keys(allPools)[0]]);




    // export async function curveApiCallWIP(): Promise<void> {
//     await curveInit();
//     const getPoolsResponse = await axios.get<IDict<PoolResponse>>("https://api.curve.fi/api/getPools/all");
//     const allPools = getPoolsResponse.data.data;

//     const inputCoinAddress = "0xD533a949740bb3306d119CC777fa900bA034cd52";
//     const outputCoinAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

//     const pools: IDict<IPoolData> = {};
//     const poolList = curve.getPoolList();
//     for (let i = 0; i < poolList.length; i++) {
//         const res = curve.getPool(poolList[i]);
//         console.log(res);
//         const pool: IPoolData = {
//             name: res.name,
//             full_name: res.fullName,
//             symbol: res.symbol,
//             reference_asset: res.referenceAsset as REFERENCE_ASSET_TYPE,
//             swap_address: "",
//             token_address: res.lpToken,
//             gauge_address: res.gauge,
//             deposit_address: "",
//             sCurveRewards_address: res.sRewardContract || constants.AddressZero,
//             reward_contract: res.rewardContract || constants.AddressZero,
//             implementation_address: "",
//             is_plain: res.isPlain,
//             is_lending: res.isLending,
//             is_meta: res.isMeta,
//             is_fake: res.isFake,
//             is_factory: res.isFactory,
//             base_pool: res.basePool,
//             meta_coin_idx: res.metaCoinIdx,
//             underlying_coins: res.underlyingCoins,
//             wrapped_coins: res.wrappedCoins,
//             underlying_coin_addresses: res.underlyingCoinAddresses,
//             wrapped_coin_addresses: res.wrappedCoinAddresses,
//             underlying_decimals: res.underlyingDecimals,
//             wrapped_decimals: res.wrappedDecimals,
//             use_lending: res.useLending,
//             swap_abi: "",
//             gauge_abi: "",
//             deposit_abi: "",
//             sCurveRewards_abi: "",
//             in_api: res.inApi
//         }
//         pools[i.toString()] = pool;
//     }



//     console.log("poolList", poolList);
//     console.log("POOL", curve.getPool('dusd'))

//     console.log("PING", allPools);

//     // const routes = findAllRoutes(inputCoinAddress, outputCoinAddress, pools,);
// }