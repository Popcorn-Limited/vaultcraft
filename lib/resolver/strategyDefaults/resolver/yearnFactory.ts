import { Address, getAddress } from "viem";
import { StrategyDefaultResolverParams } from "../index.js";
import axios from "axios";
import { StrategyDefault } from "vaultcraft-sdk/dist/vaultFactory/strategyDefaults/index.js";

type BalancerGauge = {
  address: Address;
  lpToken: Address;
};

type PoolData = {
  lpTokenAddress: Address;
  gaugeAddress: Address;
  gaugeCrvApy: number[];
};

export async function yearnFactory({
  chainId,
  client,
  address,
}: StrategyDefaultResolverParams): Promise<any[]> {
  const balancerGauges = await getBalancerGauges(chainId);
  const balResult = balancerGauges.find(
    (bal) => getAddress(bal.lpToken) === getAddress(address)
  );
  if (balResult) {
    return [getAddress(balResult.address), 1];
  }

  const curvePoolData = await getCurvePoolData(chainId);
  const crvResult = curvePoolData.find(
    (crv) => getAddress(crv.lpTokenAddress) === getAddress(address)
  );
  if (crvResult) {
    return [getAddress(crvResult.gaugeAddress), 1];
  }
  return [];
}

async function getBalancerGauges(chainId: number): Promise<BalancerGauge[]> {
  // each chain (Mainnet, Arbitrum, Polygon) has their own subgraph:
  // https://docs.balancer.fi/reference/vebal-and-gauges/gauges.html#query-pending-tokens-for-a-given-pool
  const res = await axios.post(
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges",
    {
      headers: {
        "Content-Type": "application/json",
      },
      query: `
      {
          liquidityGauges(
              where:{
              isKilled: false,
              }
          ) {
              id,
              poolAddress,
          }
      }
    `,
    }
  );

  return res.data.data.liquidityGauges.map(
    (gauge: { id: Address; poolAddress: Address }) => {
      return {
        address: getAddress(gauge.id),
        lpToken: getAddress(gauge.poolAddress),
      } as BalancerGauge;
    }
  );
}

async function getCurvePoolData(chainId: number): Promise<PoolData[]> {
  let poolData;
  if (!poolData) {
    const main = axios.get(`https://api.curve.fi/api/getPools/ethereum/main`);
    const crypto = axios.get(
      `https://api.curve.fi/api/getPools/ethereum/crypto`
    );
    const factory = axios.get(
      `https://api.curve.fi/api/getPools/ethereum/factory`
    );
    const factoryCrypto = axios.get(
      `https://api.curve.fi/api/getPools/ethereum/factory-crypto`
    );
    const factoryCrvusd = axios.get(
      `https://api.curve.fi/api/getPools/ethereum/factory-crvusd`
    );
    const factoryTtricrypto = axios.get(
      `https://api.curve.fi/api/getPools/ethereum/factory-tricrypto`
    );

    const responses = await Promise.all([
      main,
      crypto,
      factory,
      factoryCrypto,
      factoryCrvusd,
      factoryTtricrypto,
    ]);
    const pools = responses.map((resp) => resp.data);
    poolData = pools.map((pool) => pool.data.poolData).flat();
  }
  return poolData;
}
