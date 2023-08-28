import { ChainId, RPC_URLS } from '@/lib/connectors'
import YieldOptions from 'vaultcraft-sdk/src/yieldOptions'
import { useState, useEffect } from "react";

export default function Test() {
  const [ready, setReady] = useState(false)

  const sdk = new YieldOptions(RPC_URLS[1])
  sdk.setupNetwork(ChainId.Ethereum).then(res => setReady(true))

  useEffect(() => {
    if (ready) {
      console.log(sdk.getProtocols(ChainId.Ethereum))
    }
  }, [ready])
  return <></>
}