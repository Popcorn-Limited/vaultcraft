import { atom } from "jotai";
import { CachedProvider, LiveProvider, YieldOptions } from 'vaultcraft-sdk';
import { Clients } from 'vaultcraft-sdk/dist/yieldOptions/providers/protocols';
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { ChainId, RPC_URLS } from "@/lib/connectors";


// const ttl = 360_000;
// // TODO figure out the type issues here
// const provider = new CachedProvider();
// provider.initialize("https://raw.githubusercontent.com/Popcorn-Limited/apy-data/main/apy-data.json");

// export const yieldOptionsStore = atom<YieldOptions>(new YieldOptions(provider, ttl));
// export const yieldOptions = atom<YieldOptions>(get => get(yieldOptionsStore));