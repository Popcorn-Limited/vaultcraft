import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { VAULTRON, VaultronAbi } from "@/lib/constants";
import { createPublicClient, http } from "viem";
import { polygon } from "viem/chains";
import { RPC_URLS } from "@/lib/utils/connectors";

function getMultiplier(lvl: string): number {
  switch (lvl) {
    case "1":
      return 1;
    case "2":
      return 1.5;
    case "3":
      return 2;
    default:
      return 1;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const client = createPublicClient({
    chain: polygon,
    transport: http(RPC_URLS[polygon.id]),
  })

  const logs = await client.getContractEvents({
    address: VAULTRON,
    abi: VaultronAbi,
    eventName: "MetadataUpdate",
    fromBlock: "earliest",
    toBlock: "latest"
  })
  const datas = await client.readContract({
    address: VAULTRON,
    abi: VaultronAbi,
    functionName: "getTokenDetailsBulk",
    args: [BigInt(1), BigInt(logs.length)]
  })

  const nftData = await Promise.all(
    datas.map(async (d) => {
      try {
        return axios.get(d.tokenUri)
      }
      catch (e) {
        return { data: { propoerties: { XP: { value: 0 }, Level: { value: "1" } } } }
      }
    })
  )

  const totalXp = nftData.map(nft => Number(nft.data.properties.XP?.value || 0) * getMultiplier(nft.data.properties.Level?.value || "1")).reduce((a, b) => a + b, 0)

  return res.status(200).json(totalXp);
}
