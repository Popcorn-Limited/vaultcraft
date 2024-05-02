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

export default async function fetchVaultron(account: Address, client: PublicClient): Promise<VaultronStats> {
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

    const datas = await client.readContract({
      address: VAULTRON,
      abi: VaultronAbi,
      functionName: "getTokenDetailsBulk",
      args: [BigInt(1), BigInt(620)]
    })
    const res = await Promise.all(datas.map(async (d) => axios.get(d.tokenUri)))
    const totalXp = res.map(r => Number(r.data.properties.XP?.value || 0)).reduce((a, b) => a + b, 0)

    return {
      level: Number(data.properties.Level.value),
      xp: Number(data.properties.XP?.value || 0),
      animation: data.animation_url,
      image: data.image,
      tokenId: Number(tokenId),
      totalXp: totalXp,
    }
  } catch (e) {
    console.log(e)
    return DEFAULT_VAULTRON
  }
}