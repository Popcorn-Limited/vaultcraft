import { useState, useEffect } from "react"
import { AddressesByChain } from "@/lib/types"
import VaultsContainer from "./VaultsContainer"
import Carousel from "@/components/common/Carousel"
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors"
import axios from "axios"
async function getFlagshipVaults(): Promise<AddressesByChain> {
  const result: AddressesByChain = {}
  await Promise.all(
    SUPPORTED_NETWORKS.map(async (chain) => {
      const res = await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/vaults/flagship/${chain.id}.json`
      )
      result[chain.id] = res.data
    })
  )
  return result;
}

export default function FlagshipVaultContainer(){
  const [flagshipVaults, setFlagshipVaults] = useState<AddressesByChain>({})

  useEffect(() => {
    getFlagshipVaults().then(res => setFlagshipVaults(res))
  }, [])

  return Object.keys(flagshipVaults).length > 0 ?
    <>
      <Carousel />
      <VaultsContainer hiddenVaults={{}} displayVaults={flagshipVaults} />
    </>
    : <></>
}