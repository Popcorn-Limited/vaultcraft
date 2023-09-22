import { ChainId, RPC_URLS } from '@/lib/connectors'
import { useState, useEffect } from "react";
import { CachedProvider, LiveProvider, YieldOptions } from 'vaultcraft-sdk';
import { Clients } from 'vaultcraft-sdk/dist/yieldOptions/providers/protocols';
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// @ts-ignore
import NoSSR from 'react-no-ssr';
import { useAtom } from 'jotai';
import axios from "axios";
import { getConvexPools } from '@/lib/external/convex';

async function setUpYieldOptions() {
  const ttl = 360_000;
  // TODO figure out the type issues here
  const provider = new CachedProvider();
  await provider.initialize("https://raw.githubusercontent.com/Popcorn-Limited/apy-data/main/apy-data.json");

  return new YieldOptions(provider, ttl);

}

function TestContainer() {
  getConvexPools({ chainId: 1 })

  return <></>
}

export default function Test() {
  return <NoSSR><TestContainer /></NoSSR>
}