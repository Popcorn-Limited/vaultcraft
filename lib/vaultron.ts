import { Address } from "viem";
import { PublicClient } from "wagmi";
import { VAULTRON, VaultronAbi } from "@/lib/constants";
import { VaultronStats } from "@/lib/types";
import axios from "axios";

export const DEFAULT_VAULTRON: VaultronStats = {
  level: 0,
  xp: 0,
  animation: "",
  image: "",
  tokenId: 0,
  totalXp: 0,
}

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

export default async function fetchVaultron(account: Address, client: PublicClient): Promise<VaultronStats> {
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

  const res = await Promise.all(datas.map(async (d) => axios.get(d.tokenUri)))
  const totalXp = res.map(r => Number(r.data.properties.XP?.value || 0) * getMultiplier(r.data.properties.Level?.value || "1")).reduce((a, b) => a + b, 0)

  try {
    const tokenId = await client.readContract({
      address: VAULTRON,
      abi: VaultronAbi,
      functionName: "getActiveTokenId",
      args: [account]
    })
    const tokenURI = await client.readContract({
      address: VAULTRON,
      abi: VaultronAbi,
      functionName: "tokenURI",
      args: [tokenId]
    })
    const { data } = await axios.get(tokenURI)

    return {
      level: Number(data.properties.Level.value),
      xp: Number(data.properties.XP?.value || 0) * getMultiplier(data.properties.Level?.value),
      animation: data.animation_url,
      image: data.image,
      tokenId: Number(tokenId),
      totalXp: totalXp,
    }
  } catch (e) {
    console.log(e)
    return { ...DEFAULT_VAULTRON, totalXp }
  }
}