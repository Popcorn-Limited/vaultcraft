import { atom } from "jotai";
import { StrategiesByChain } from "@/lib/types";

// Used in most of the app
export const strategiesAtom = atom<StrategiesByChain>({});