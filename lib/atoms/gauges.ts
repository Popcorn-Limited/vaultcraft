import { atom } from "jotai";
import { GaugeRewards } from "@/lib/gauges/getGaugeRewards";

export type GaugeRewardsByChain = { 
  [key: number]: GaugeRewards
} 

export const gaugeRewardsAtom = atom<GaugeRewardsByChain>({})
