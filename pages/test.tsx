import { VaultAbi } from "@/lib/constants";
import { RPC_URLS } from "@/lib/utils/connectors";
import { useState } from "react";
import { createPublicClient, http } from "viem";
import { sepolia, usePublicClient } from "wagmi";

async function doSmth(client) {
  const res = await client.readContract({
    address: "0xd870dE4D952832de779eb770f7DfE6148064C9a7",
    abi: VaultAbi,
    functionName: 'symbol',
    chainId: 11155111
  })
  console.log(res)
}

export default function Test() {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URLS[11155111]),
  })

  doSmth(publicClient)

  return <div className="text-white">

  </div>
}