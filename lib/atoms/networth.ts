import { atom } from "jotai";


export type TVL = {
  vault: number;
  lockVault: number;
  stake: number;
  total: number;
}

const DEFAULT_TVL = {
  vault: 0,
  lockVault: 0,
  stake: 0,
  total: 0,
}

export const tvlAtom = atom<TVL>(DEFAULT_TVL)

export type Networth = {
  wallet: number;
  stake: number;
  vault: number;
  lockVault: number;
  total: number;
}

const DEFAULT_NETWORTH = {
  wallet: 0,
  stake: 0,
  vault: 0,
  lockVault: 0,
  total: 0,
}

export const networthAtom = atom<Networth>(DEFAULT_NETWORTH)
