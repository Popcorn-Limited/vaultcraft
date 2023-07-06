import { findAllRoutes } from "@/lib/external/curve/router";
import { IDict, IPoolData, INativeToken, CHAIN_ID_TYPE } from "@/lib/external/curve/router/interfaces";
import { PoolResponse } from "@/lib/external/curve/router/interfaces";
import axios from "axios";
import curve from '@curvefi/api'

const curveInit: () => Promise<void> = async () => {
    await curve.init("Alchemy", { network: "homestead", apiKey: "KsuP431uPWKR3KFb-K_0MT1jcwpUnjAg" }, { chainId: 1 });
    await curve.factory.fetchPools();
    await curve.crvUSDFactory.fetchPools();
    await curve.EYWAFactory.fetchPools();
    await curve.cryptoFactory.fetchPools();
    await curve.tricryptoFactory.fetchPools();
}

export async function curveApiCall(): Promise<void> {
    await curveInit();
    let pools: IDict<IPoolData>;
    const allPools = await axios.get<IDict<PoolResponse>>("https://api.curve.fi/api/getPools/all");
    const allPoolsLength = Object.keys(allPools.data.data).length;
    const pool = curve.getPool('factory-v2-11');

    for (let i = 0; i < allPoolsLength; i++) {

    }

    console.log("PING", allPools.data.data);
    console.log("DING", pool);

    const curvePools = allPools.data.data;
    console.log(curvePools);

    const inputCoinAddress = "0xD533a949740bb3306d119CC777fa900bA034cd52";
    const outputCoinAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    // const routes = findAllRoutes(inputCoinAddress, outputCoinAddress);
}

