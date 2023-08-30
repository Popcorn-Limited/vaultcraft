import { ChainId, RPC_URLS } from '@/lib/connectors'
import { useState, useEffect } from "react";
import { YieldOptions } from 'vaultcraft-sdk';

export default function Test() {
  const sdk = new YieldOptions(RPC_URLS[1])
  sdk.setupNetwork(ChainId.Ethereum)

  return <></>
}