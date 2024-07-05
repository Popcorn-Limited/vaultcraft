import type { NextPage } from "next";
import VaultsContainer from "@/components/vault/VaultsContainer";
import { AddressesByChain } from "@/lib/types";
import axios from "axios";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { useEffect, useState } from "react";

async function getHiddenVaults(): Promise<AddressesByChain> {
  const result: AddressesByChain = {};
  await Promise.all(
    SUPPORTED_NETWORKS.map(async (chain) => {
      const res = await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/hidden/${chain.id}.json`
      );
      result[chain.id] = res.data;
    })
  );
  return result;
}

const Vaults: NextPage = () => {
  const [hiddenVaults, setHiddenVaults] = useState<AddressesByChain>({})

  useEffect(() => {
    getHiddenVaults().then(res => setHiddenVaults(res))
  }, [])

  return Object.keys(hiddenVaults).length > 0 ? (
    <VaultsContainer hiddenVaults={hiddenVaults} displayVaults={{}} />
  ) : (
    <p className="text-white">Loading...</p>
  );
};

export default Vaults;
