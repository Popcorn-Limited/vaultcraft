import { atom, useAtom } from "jotai"

export const stableAtom = atom<number>(0)

export const readStableAtom = atom((get) => get(stableAtom))

export const writeStableAtom = atom(
  null,
  (get, set, update) => {
    set(stableAtom, get(stableAtom) + 1)
  })