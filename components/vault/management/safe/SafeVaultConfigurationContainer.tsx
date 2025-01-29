import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";
import { VaultData } from "@/lib/types";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { useEffect, useState } from "react";
import { vaultsAtom } from "@/lib/atoms/vaults";
import useNetworkFilter from "@/lib/useNetworkFilter";
import NetworkFilter from "@/components/network/NetworkFilter";
import VaultsSorting from "@/components/vault/VaultsSorting";
import SearchBar from "@/components/input/SearchBar";
import SafeVaultConfiguration from "./SafeVaultConfiguration";


export default function SafeVaultConfigurationContainer() {
  const [tokens] = useAtom(tokensAtom)
  const [vaultsData] = useAtom(vaultsAtom)
  const [vaults, setVaults] = useState<VaultData[]>([]);

  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS.map((network) => network.id));
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (Object.keys(vaultsData).length > 0 && vaults.length === 0) {
      setVaults(SUPPORTED_NETWORKS.map((chain) => vaultsData[chain.id]).flat().filter(vault => vault.metadata.type.includes("safe-vault")));
    }
  }, [vaultsData, vaults]);

  function handleSearch(value: string) {
    setSearchTerm(value);
  }

  return (
    <div>
      <nav className="[&_>*]:shrink-0 mt-8 [&_.my-10]:my-0 whitespace-nowrap flex flex-col smmd:flex-row gap-4 mb-10">
        <NetworkFilter
          supportedNetworks={SUPPORTED_NETWORKS.map((chain) => chain.id)}
          selectNetwork={selectNetwork}
        />

        <section className="flex gap-3 flex-grow items-center justify-end">
          <SearchBar
            className="!w-full [&_input]:w-full smmd:!w-auto h-[3.5rem] !border-customGray500"
            searchTerm={searchTerm}
            handleSearch={handleSearch}
          />
          <VaultsSorting
            className="[&_button]:h-[3.5rem]"
            vaultState={[vaults, setVaults]}
          />
        </section>
      </nav>
      <section className="space-y-4">
        {Object.keys(tokens).length > 0 &&
          vaults
            .filter(
              (vault) => selectedNetworks.includes(vault.chainId)
            )
            .filter(
              (vault) => searchTerm.length > 0 ? (
                vault.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vault.metadata.vaultName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vault.asset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tokens[vault.chainId][vault.asset].symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tokens[vault.chainId][vault.asset].name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vault.strategies.some(strategy => strategy.metadata.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                searchTerm.toLowerCase().includes("multi") && vault.strategies.length > 1
              ) : true
            ).
            map(vault => <SafeVaultConfiguration key={vault.address} vault={vault} />)
        }
      </section>
    </div>
  )
}