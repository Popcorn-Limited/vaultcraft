import { atom } from "jotai";
import { ReserveData, UserAccountData } from "@/lib/types";

export const aaveReserveDataAtom = atom<ReserveData[]>([]);
export const aaveAccountDataAtom = atom<UserAccountData>({
  totalCollateral: 0,
  totalBorrowed: 0,
  netValue: 0,
  totalSupplyRate: 0,
  totalBorrowRate: 0,
  netRate: 0,
  healthFactor: 0
})
