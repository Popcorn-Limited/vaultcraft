import type { NextPage } from "next";
import VaultsContainer from "@/components/vault/VaultsContainer";
import axios from "axios";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { AddressesByChain } from "@/lib/types";
import { useEffect, useState } from "react";

async function getFlagshipVaults(): Promise<AddressesByChain> {
  const result: AddressesByChain = {}
  await Promise.all(
    SUPPORTED_NETWORKS.map(async (chain) => {
      const res = await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/flagship/${chain.id}.json`
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
    <VaultsContainer hiddenVaults={{}} displayVaults={flagshipVaults} />
    : <p className="text-white">Loading...</p>;
};

export default Vaults;
