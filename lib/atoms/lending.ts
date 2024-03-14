import { atom } from "jotai";
import { ReserveData, UserAccountData } from "@/lib/types";

export const EMPTY_USER_ACCOUNT_DATA = {
  totalCollateral: 0,
  totalBorrowed: 0,
  netValue: 0,
  totalSupplyRate: 0,
  totalBorrowRate: 0,
  netRate: 0,
  ltv: 0,
  healthFactor: 0
}

export const aaveReserveDataAtom = atom<{ [key: number]: ReserveData[] }>({});
export const aaveAccountDataAtom = atom<{ [key: number]: UserAccountData }>({})
