import type { NextPage } from "next";
import VaultsContainer from "@/components/vault/VaultsContainer";
import axios from "axios";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { AddressesByChain } from "@/lib/types";
import { useEffect, useState } from "react";
import Carousel from "@/components/common/Carousel";

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

const Vaults: NextPage = () => {
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
};

export default Vaults;
