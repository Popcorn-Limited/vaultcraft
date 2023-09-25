import { ChainId, RPC_URLS } from '@/lib/connectors'
import { useState, useEffect } from "react";
import { CachedProvider, LiveProvider, YieldOptions } from 'vaultcraft-sdk';
import { Clients } from 'vaultcraft-sdk/dist/yieldOptions/providers/protocols';
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// @ts-ignore
import NoSSR from 'react-no-ssr';
import axios from "axios";
import { yieldOptionsAtom } from '@/lib/atoms/sdk';
import { atom, useAtom } from 'jotai';
import { assetAddressesAtom } from '@/lib/atoms';
import { convexBoosterAbi, CONVEX_BOOSTER_ADDRESS } from "@/lib/external/convex";




function TestContainer() {
  const client = createPublicClient({
    chain: mainnet,
    transport: http()
  })
  client.readContract({
    address: CONVEX_BOOSTER_ADDRESS[1],
    abi: convexBoosterAbi,
    functionName: "poolLength"
  }).then(res => console.log(res))

  return <></>
}

export default function Test() {
  return <NoSSR><TestContainer /></NoSSR>
}