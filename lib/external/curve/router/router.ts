import { IDict, IPoolData, IRoute, IRouteTvl, INativeToken, CHAIN_ID_TYPE } from "./interfaces";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const getNewRoute = (
  routeTvl: IRouteTvl,
  poolId: string,
  poolAddress: string,
  inputCoinAddress: string,
  outputCoinAddress: string,
  i: number,
  j: number,
  swapType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
  swapAddress: string,
  tvl: number
): IRouteTvl => {
  const routePoolIds = routeTvl.route.map((s) => s.poolId);
  // Steps <= 4
  if (routePoolIds.length >= 4) return { route: [], minTvl: Infinity, totalTvl: 0 };
  // Exclude such cases as cvxeth -> tricrypto2 -> tricrypto2 -> susd
  // @ts-ignore
  if (routePoolIds.includes(poolId)) return { route: [], minTvl: Infinity, totalTvl: 0 };
  return {
    route: [...routeTvl.route, { poolId, poolAddress, inputCoinAddress, outputCoinAddress, i, j, swapType, swapAddress }],
    minTvl: Math.min(tvl, routeTvl.minTvl),
    totalTvl: routeTvl.totalTvl + tvl,
  }
}

// TODO REMOVE IT!!!
const filterMaticFactory83Route = (routes: IRouteTvl[], nativeToken: INativeToken) => {
  return routes.filter((r) => {
    for (let i = 0; i < r.route.length; i++) {
      const step = r.route[i];
      if (step.poolId === "factory-crypto-83" && step.inputCoinAddress === nativeToken.address) return false;
    }

    return true
  });
}

// TODO REMOVE IT!!!
const filterAvax = (routes: IRouteTvl[]) => {
  return routes.filter((r) => {
    for (let i = 0; i < r.route.length; i++) {
      const step = r.route[i];
      if (step.poolId == 'avaxcrypto' && step.swapType == 4 && (step.i === 3 || step.j === 3)) return false;
    }

    return true
  });
}


const MAX_ROUTES_FOR_ONE_COIN = 3;
const filterRoutes = (
  routes: IRouteTvl[],
  inputCoinAddress: string,
  sortFn: (a: IRouteTvl, b: IRouteTvl) => number,
  chainId: CHAIN_ID_TYPE,
  nativeToken: INativeToken,
) => {
  // TODO REMOVE IT!!!
  if (chainId === 137) routes = filterMaticFactory83Route(routes, nativeToken);
  if (chainId === 43114) routes = filterAvax(routes);
  return routes
    .filter((r) => r.route.length > 0)
    .filter((r) => r.route[0].inputCoinAddress === inputCoinAddress) // Truncated routes
    .filter((r, i, _routes) => {
      const routesByPoolIds = _routes.map((r) => r.route.map((s) => s.poolId).toString());
      return routesByPoolIds.indexOf(r.route.map((s) => s.poolId).toString()) === i;
    }) // Route duplications
    .sort(sortFn).slice(0, MAX_ROUTES_FOR_ONE_COIN);
}

const sortByTvl = (a: IRouteTvl, b: IRouteTvl) => b.minTvl - a.minTvl || b.totalTvl - a.totalTvl || a.route.length - b.route.length;
const sortByLength = (a: IRouteTvl, b: IRouteTvl) => a.route.length - b.route.length || b.minTvl - a.minTvl || b.totalTvl - a.totalTvl;


// Inspired by Dijkstra's algorithm
export const findAllRoutes = (
  inputCoinAddress: string,
  outputCoinAddress: string,
  pools: IDict<IPoolData>,
  ADict: IDict<number>,
  chainId: CHAIN_ID_TYPE,
  nativeToken: INativeToken,
  tvlDict: IDict<number>,
): IRoute[] => {
  inputCoinAddress = inputCoinAddress.toLowerCase();
  outputCoinAddress = outputCoinAddress.toLowerCase();

  // @ts-ignore
  const ALL_POOLS = Object.entries(pools);
  const amplificationCoefficientDict = ADict;

  // Coins we are searching routes for on the current step
  let curCoins: string[] = [inputCoinAddress];
  // Coins we will search routes for on the next step
  let nextCoins: Set<string> = new Set();
  // Routes for all coins found
  const routesByTvl: IDict<IRouteTvl[]> = {
    [inputCoinAddress]: [{ route: [], minTvl: Infinity, totalTvl: 0 }],
  };
  const routesByLength: IDict<IRouteTvl[]> = {
    [inputCoinAddress]: [{ route: [], minTvl: Infinity, totalTvl: 0 }],
  };

  // No more than 4 steps (swaps)
  for (let step = 0; step < 4; step++) {
    for (const inCoin of curCoins) {
      // @ts-ignore
      if (chainId !== 42220 && [nativeToken.address, nativeToken.wrappedAddress].includes(inCoin)) { // Exclude Celo
        const outCoin = inCoin === nativeToken.address ? nativeToken.wrappedAddress : nativeToken.address;

        const newRoutesByTvl: IRouteTvl[] = routesByTvl[inCoin].map(
          (route) => getNewRoute(
            route,
            "wrapper",
            nativeToken.wrappedAddress,
            inCoin,
            outCoin,
            0,
            0,
            15,
            ZERO_ADDRESS,
            Infinity
          )
        );

        const newRoutesByLength: IRouteTvl[] = routesByLength[inCoin].map(
          (route) => getNewRoute(
            route,
            "wrapper",
            nativeToken.wrappedAddress,
            inCoin,
            outCoin,
            0,
            0,
            15,
            ZERO_ADDRESS,
            Infinity
          )
        );

        routesByTvl[outCoin] = [...(routesByTvl[outCoin] ?? []), ...newRoutesByTvl]
        routesByTvl[outCoin] = filterRoutes(routesByTvl[outCoin], inputCoinAddress, sortByTvl, chainId, nativeToken);

        routesByLength[outCoin] = [...(routesByLength[outCoin] ?? []), ...newRoutesByLength]
        routesByLength[outCoin] = filterRoutes(routesByLength[outCoin], inputCoinAddress, sortByLength, chainId, nativeToken);

        nextCoins.add(outCoin);
      }
      for (const [poolId, poolData] of ALL_POOLS) {
        const wrapped_coin_addresses = poolData.wrapped_coin_addresses.map((a: string) => a.toLowerCase());
        const underlying_coin_addresses = poolData.underlying_coin_addresses.map((a: string) => a.toLowerCase());
        const base_pool = poolData.is_meta ? pools[poolData.base_pool as string] : null;
        const meta_coin_addresses = base_pool ? base_pool.underlying_coin_addresses.map((a: string) => a.toLowerCase()) : [];
        const token_address = poolData.token_address.toLowerCase();
        const is_aave_like_lending = poolData.is_lending && wrapped_coin_addresses.length === 3 && !poolData.deposit_address;
        const tvlMultiplier = poolData.is_crypto ? 1 : (amplificationCoefficientDict[poolData.swap_address] ?? 1);

        const inCoinIndexes = {
          wrapped_coin: wrapped_coin_addresses.indexOf(inCoin),
          underlying_coin: underlying_coin_addresses.indexOf(inCoin),
          meta_coin: meta_coin_addresses ? meta_coin_addresses.indexOf(inCoin) : -1,
        }

        // Skip pools which don't contain inCoin
        if (inCoinIndexes.wrapped_coin === -1 && inCoinIndexes.underlying_coin === -1 && inCoinIndexes.meta_coin === -1 && inCoin !== token_address) continue;

        const tvl = tvlDict[poolId] * tvlMultiplier;
        // Skip empty pools
        if (tvl === 0) continue;

        let poolAddress = poolData.is_fake ? poolData.deposit_address as string : poolData.swap_address;
        const coin_addresses = (is_aave_like_lending || poolData.is_fake) ? underlying_coin_addresses : wrapped_coin_addresses;

        // LP -> wrapped coin (underlying for lending or fake pool) "swaps" (actually remove_liquidity_one_coin)
        if (coin_addresses.length < 6 && inCoin === token_address) {
          for (let j = 0; j < coin_addresses.length; j++) {
            // Looking for outputCoinAddress only on the final step
            if (step === 3 && coin_addresses[j] !== outputCoinAddress) continue;

            // Exclude such cases as cvxeth -> tricrypto2 -> tusd -> susd or cvxeth -> tricrypto2 -> susd -> susd
            const outputCoinIdx = coin_addresses.indexOf(outputCoinAddress);
            if (outputCoinIdx >= 0 && j !== outputCoinIdx) continue;

            const swapType = poolData.is_crypto ? 14 : is_aave_like_lending ? 13 : 12;

            const newRoutesByTvl: IRouteTvl[] = routesByTvl[inCoin].map(
              (route) => getNewRoute(
                route,
                poolId,
                poolAddress,
                inCoin,
                coin_addresses[j],
                0,
                j,
                swapType,
                ZERO_ADDRESS,
                tvl
              )
            );

            const newRoutesByLength: IRouteTvl[] = routesByLength[inCoin].map(
              (route) => getNewRoute(
                route,
                poolId,
                poolAddress,
                inCoin,
                coin_addresses[j],
                0,
                j,
                swapType,
                ZERO_ADDRESS,
                tvl
              )
            );

            routesByTvl[coin_addresses[j]] = [...(routesByTvl[coin_addresses[j]] ?? []), ...newRoutesByTvl];
            routesByTvl[coin_addresses[j]] = filterRoutes(routesByTvl[coin_addresses[j]], inputCoinAddress, sortByTvl, chainId, nativeToken);

            routesByLength[coin_addresses[j]] = [...(routesByLength[coin_addresses[j]] ?? []), ...newRoutesByLength];
            routesByLength[coin_addresses[j]] = filterRoutes(routesByLength[coin_addresses[j]], inputCoinAddress, sortByLength, chainId, nativeToken);

            nextCoins.add(coin_addresses[j]);
          }
        }

        // Wrapped coin (underlying for lending or fake pool) -> LP "swaps" (actually add_liquidity)
        const inCoinIndex = (is_aave_like_lending || poolData.is_fake) ? inCoinIndexes.underlying_coin : inCoinIndexes.wrapped_coin;
        if (coin_addresses.length < 6 && inCoinIndex >= 0) {
          // Looking for outputCoinAddress only on the final step
          if (!(step === 3 && token_address !== outputCoinAddress)) {
            const swapType = is_aave_like_lending ? 9
              : coin_addresses.length === 2 ? 7
                : coin_addresses.length === 3 ? 8
                  : coin_addresses.length === 4 ? 10 : 11;

            const newRoutesByTvl: IRouteTvl[] = routesByTvl[inCoin].map(
              (route) => getNewRoute(
                route,
                poolId,
                poolAddress,
                inCoin,
                token_address,
                coin_addresses.indexOf(inCoin),
                0,
                swapType,
                ZERO_ADDRESS,
                tvl
              )
            );

            const newRoutesByLength: IRouteTvl[] = routesByLength[inCoin].map(
              (route) => getNewRoute(
                route,
                poolId,
                poolAddress,
                inCoin,
                token_address,
                coin_addresses.indexOf(inCoin),
                0,
                swapType,
                ZERO_ADDRESS,
                tvl
              )
            );

            routesByTvl[token_address] = [...(routesByTvl[token_address] ?? []), ...newRoutesByTvl]
            routesByTvl[token_address] = filterRoutes(routesByTvl[token_address], inputCoinAddress, sortByTvl, chainId, nativeToken);

            routesByLength[token_address] = [...(routesByLength[token_address] ?? []), ...newRoutesByLength];
            routesByLength[token_address] = filterRoutes(routesByLength[token_address], inputCoinAddress, sortByLength, chainId, nativeToken);

            nextCoins.add(token_address);
          }
        }

        // Wrapped swaps
        if (inCoinIndexes.wrapped_coin >= 0 && !poolData.is_fake) {
          for (let j = 0; j < wrapped_coin_addresses.length; j++) {
            if (j === inCoinIndexes.wrapped_coin) continue;
            // Native swaps spend less gas
            // TODO uncomment
            // if (wrapped_coin_addresses[j] !== outputCoinAddress && wrapped_coin_addresses[j] === nativeToken.wrappedAddress) continue;
            // Looking for outputCoinAddress only on the final step
            if (step === 3 && wrapped_coin_addresses[j] !== outputCoinAddress) continue;
            // Exclude such cases as cvxeth -> tricrypto2 -> tusd -> susd or cvxeth -> tricrypto2 -> susd -> susd
            const outputCoinIdx = wrapped_coin_addresses.indexOf(outputCoinAddress);
            if (outputCoinIdx >= 0 && j !== outputCoinIdx) continue;

            const swapType = poolData.is_crypto ? 3 : 1;

            const newRoutesByTvl: IRouteTvl[] = routesByTvl[inCoin].map(
              (route) => getNewRoute(
                route,
                poolId,
                poolData.swap_address,
                inCoin,
                wrapped_coin_addresses[j],
                inCoinIndexes.wrapped_coin,
                j,
                swapType,
                ZERO_ADDRESS,
                tvl
              )
            );

            const newRoutesByLength: IRouteTvl[] = routesByLength[inCoin].map(
              (route) => getNewRoute(
                route,
                poolId,
                poolData.swap_address,
                inCoin,
                wrapped_coin_addresses[j],
                inCoinIndexes.wrapped_coin,
                j,
                swapType,
                ZERO_ADDRESS,
                tvl
              )
            );

            routesByTvl[wrapped_coin_addresses[j]] = [...(routesByTvl[wrapped_coin_addresses[j]] ?? []), ...newRoutesByTvl];
            routesByTvl[wrapped_coin_addresses[j]] = filterRoutes(routesByTvl[wrapped_coin_addresses[j]], inputCoinAddress, sortByTvl, chainId, nativeToken);

            routesByLength[wrapped_coin_addresses[j]] = [...(routesByLength[wrapped_coin_addresses[j]] ?? []), ...newRoutesByLength];
            routesByLength[wrapped_coin_addresses[j]] = filterRoutes(routesByLength[wrapped_coin_addresses[j]], inputCoinAddress, sortByLength, chainId, nativeToken);

            nextCoins.add(wrapped_coin_addresses[j]);
          }
        }

        // Only for underlying swaps
        poolAddress = (poolData.is_crypto && poolData.is_meta) || (base_pool?.is_lending && poolData.is_factory) ?
          poolData.deposit_address as string : poolData.swap_address;

        // Underlying swaps
        if (!poolData.is_plain && inCoinIndexes.underlying_coin >= 0) {
          for (let j = 0; j < underlying_coin_addresses.length; j++) {
            if (j === inCoinIndexes.underlying_coin) continue;
            // Don't swap metacoins since they can be swapped directly in base pool
            // @ts-ignore
            if (inCoinIndexes.meta_coin >= 0 && meta_coin_addresses.includes(underlying_coin_addresses[j])) continue;
            // Looking for outputCoinAddress only on the final step
            if (step === 3 && underlying_coin_addresses[j] !== outputCoinAddress) continue;
            // Exclude such cases as cvxeth -> tricrypto2 -> tusd -> susd or cvxeth -> tricrypto2 -> susd -> susd
            const outputCoinIdx = underlying_coin_addresses.indexOf(outputCoinAddress);
            if (outputCoinIdx >= 0 && j !== outputCoinIdx) continue;

            const hasEth = (inCoin === nativeToken.address || underlying_coin_addresses[j] === nativeToken.address);
            const swapType = (poolData.is_crypto && poolData.is_meta && poolData.is_factory) ? 6
              : (base_pool?.is_lending && poolData.is_factory) ? 5
                : hasEth && poolId !== 'avaxcrypto' ? 3
                  : poolData.is_crypto ? 4
                    : 2;

            const newRoutesByTvl: IRouteTvl[] = routesByTvl[inCoin].map(
              (route) => getNewRoute(
                route,
                poolId,
                poolAddress,
                inCoin,
                underlying_coin_addresses[j],
                inCoinIndexes.underlying_coin,
                j,
                swapType,
                (swapType === 5 || swapType === 6) ? poolData.swap_address : ZERO_ADDRESS,
                tvl
              )
            );

            const newRoutesByLength: IRouteTvl[] = routesByLength[inCoin].map(
              (route) => getNewRoute(
                route,
                poolId,
                poolAddress,
                inCoin,
                underlying_coin_addresses[j],
                inCoinIndexes.underlying_coin,
                j,
                swapType,
                (swapType === 5 || swapType === 6) ? poolData.swap_address : ZERO_ADDRESS,
                tvl
              )
            );

            routesByTvl[underlying_coin_addresses[j]] = [...(routesByTvl[underlying_coin_addresses[j]] ?? []), ...newRoutesByTvl];
            routesByTvl[underlying_coin_addresses[j]] = filterRoutes(routesByTvl[underlying_coin_addresses[j]], inputCoinAddress, sortByTvl, chainId, nativeToken);

            routesByLength[underlying_coin_addresses[j]] = [...(routesByLength[underlying_coin_addresses[j]] ?? []), ...newRoutesByLength];
            routesByLength[underlying_coin_addresses[j]] = filterRoutes(routesByLength[underlying_coin_addresses[j]], inputCoinAddress, sortByLength, chainId, nativeToken);

            nextCoins.add(underlying_coin_addresses[j]);
          }
        }
      }
    }

    curCoins = Array.from(nextCoins);
    nextCoins = new Set();
  }

  const routes = [...(routesByTvl[outputCoinAddress] ?? []), ...(routesByLength[outputCoinAddress] ?? [])];

  return routes.map((r) => r.route);
}
