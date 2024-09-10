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

export async function getCustomApy(address: Address, apyId: string, chainId: number): Promise<LlamaApy[]> {
  if (address === "0xB0CDFb59D54b4f5EeAa180dFb9cE3786Cc7D9835") return getLooperApy(address, "67cb77ab-9d9c-4002-9eaf-4388bc892ba5", chainId)
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
        address: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        abi: AavePoolAbi,
        functionName: "getReserveData",
        args: ["0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"]
      },
    ],
    allowFailure: true
  })

  const leveragRatio = 1e18 / (1e18 - Number(looperRes[0].result))
  const borrowRate = Number(looperRes[1].result?.currentVariableBorrowRate) / 1e25 // 1e27 * 100
  const leverageApy = baseApy.map(entry => {
    const apyBase = entry.apy + ((entry.apy - borrowRate) * (leveragRatio-1));
    const apyReward = entry.apyReward * leveragRatio;
    return {
      ...entry,
      apyBase,
      apyReward,
      apy: apyBase + apyReward
    }
  })
  return leverageApy
}