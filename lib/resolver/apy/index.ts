import getFraxlendApy from "@/lib/external/fraxlend/getFraxlendApy";
import { LlamaApy } from "@/lib/types";
import { Address, createPublicClient, http } from "viem";
import axios from "axios";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { LeverageLooperAbi } from "@/lib/constants";
import { AavePoolAbi } from "@/lib/constants/abi/Aave";

export const EMPTY_LLAMA_APY_ENTRY: LlamaApy = {
  apy: 0,
  apyBase: 0,
  apyReward: 0,
  tvl: 0,
  date: new Date(),
}

const LEVERAGE_STRATEGIES: Address[] = [
  "0x8D63e0B19753FFc1C2339689526B7c4AAD6e3758",
  "0x40B74aC60F4133b31F297767B455B4328d917809",
]

export async function getCustomApy(address: Address, apyId: string, chainId: number): Promise<LlamaApy[]> {
  if (LEVERAGE_STRATEGIES.includes(address)) {
    return getLooperApy(address, apyId, chainId)
  }
  switch (apyId) {
    case "fraxlend":
      return getFraxlendApy(address, chainId);
    default:
      return [EMPTY_LLAMA_APY_ENTRY]
  }
}

export async function getApy(apyId: string): Promise<LlamaApy[]> {
  try {
    const { data } = await axios.get(`https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/yields/chart/${apyId}`)
    return data.data.map((entry: any) => { return { apy: entry.apy, apyBase: entry.apyBase, apyReward: entry.apyReward, tvl: entry.tvlUsd, date: new Date(entry.timestamp) } })
  } catch (e) {
    console.log("ERROR FETCHING APY ", + apyId)
    console.log(e)
    return [EMPTY_LLAMA_APY_ENTRY]
  }
}

export async function getLooperApy(address: Address, apyId: string, chainId: number): Promise<LlamaApy[]> {
  const baseApy = await getApy(apyId)

  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId]),
  });

  const looperRes = await client.multicall({
    contracts: [
      {
        address,
        abi: LeverageLooperAbi,
        functionName: "getLTV",
      },
      {
        address: chainId === 137 ? "0x794a61358D6845594F94dc1DB02A252b5b4814aD" : "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
        abi: AavePoolAbi,
        functionName: "getReserveData",
        args: [chainId === 137 ? "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"]
      },
    ],
    allowFailure: true
  })

  const leveragRatio = 1e18 / (1e18 - Number(looperRes[0].result))
  const borrowRate = Number(looperRes[1].result?.currentVariableBorrowRate) / 1e25 // 1e27 * 100
  const rewardApy = chainId === 1 ? 0.94 : 0

  const leverageApy = baseApy.map(entry => {
    entry.apy = chainId === 137 ? 5 : entry.apy;
    const apyBase = entry.apy + ((entry.apy - borrowRate) * (leveragRatio - 1));
    const apyReward = (entry.apyReward + rewardApy) * leveragRatio;
    return {
      ...entry,
      apyBase,
      apyReward,
      apy: apyBase + apyReward
    }
  })
  return leverageApy
}