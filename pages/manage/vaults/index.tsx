import SpinningLogo from "@/components/common/SpinningLogo";
import VaultsContainer from "@/components/vault/VaultsContainer";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { AddressesByChain } from "@/lib/types";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export default function ManageVault() {
  const [vaultsData] = useAtom(vaultsAtom);
  const [displayVaults, setDisplayVaults] = useState({})

  useEffect(() => {
    if (Object.keys(vaultsData).length > 0 && Object.keys(displayVaults).length === 0) {
      let newDisplayVaults: AddressesByChain = {}
      SUPPORTED_NETWORKS.forEach((chain) => newDisplayVaults[chain.id] = vaultsData[chain.id].map(vault => vault.address))
      setDisplayVaults(newDisplayVaults)
    }
  }, [vaultsData, displayVaults])

  return Object.keys(displayVaults).length > 0 ? <VaultsContainer hiddenVaults={{}} displayVaults={displayVaults} manage /> : <SpinningLogo />
}
