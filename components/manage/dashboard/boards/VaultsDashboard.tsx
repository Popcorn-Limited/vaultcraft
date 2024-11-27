import AssetWithName from "@/components/common/AssetWithName";
import SpinningLogo from "@/components/common/SpinningLogo";
import SearchBar from "@/components/input/SearchBar";
import NetworkFilter from "@/components/network/NetworkFilter";
import VaultsSorting from "@/components/vault/VaultsSorting";
import { tokensAtom } from "@/lib/atoms";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { VaultData } from "@/lib/types";
import useNetworkFilter from "@/lib/useNetworkFilter";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { formatBalance, NumberFormatter } from "@/lib/utils/helpers";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export default function VaultsDashboard({ dashboardData }: { dashboardData: any }) {
  const [vaultsData] = useAtom(vaultsAtom)
  const [tokens] = useAtom(tokensAtom)
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS.map((network) => network.id));
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (Object.keys(vaultsData).length > 0 && vaults.length === 0) {
      setVaults(SUPPORTED_NETWORKS.map((chain) => vaultsData[chain.id]).flat());
    }
  }, [vaultsData, vaults]);

  function handleSearch(value: string) {
    setSearchTerm(value);
  }

  // TODO
  // - fees
  // - last harvested

  return vaults.length > 0 && Object.keys(tokens).length > 0 ?
    (
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">

          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
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

            <table className="min-w-full">
              <thead className="">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-3">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Assets
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Liquid
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Liquid %
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Idle
                  </th>
                </tr>
              </thead>
              <tbody className="">
                {vaults
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
                  )
                  .map(vault =>
                    <>
                      <tr className="border-t border-gray-200">
                        <th
                          scope="colgroup"
                          colSpan={5}
                          className="bg-customGray600 py-2 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-3"
                        >
                          <AssetWithName vault={vault} />
                        </th>
                      </tr>
                      <tr
                        className="border-gray-300 border-t"
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-3">
                          Vault
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatBalance(vault.totalAssets, tokens[vault.chainId][vault.asset].decimals)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatBalance(vault.liquid, tokens[vault.chainId][vault.asset].decimals)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {NumberFormatter.format(Number((vault.liquid / (vault.totalAssets || BigInt(1))) * BigInt(100)))} %
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatBalance(vault.idle, tokens[vault.chainId][vault.asset].decimals)}
                        </td>
                      </tr>
                      {vault.strategies.map(strategy => (
                        <tr
                          key={vault.address + strategy.address}
                          className="border-gray-200 border-t"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-3">
                            {strategy.metadata.protocol} - {strategy.metadata.name} - ({strategy.yieldToken ? tokens[vault.chainId][strategy.yieldToken].symbol : tokens[vault.chainId][vault.asset].symbol})
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatBalance(strategy.allocation, tokens[vault.chainId][vault.asset].decimals)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatBalance(strategy.idle, tokens[vault.chainId][vault.asset].decimals)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {/* TODO: fix */}
                            {/* {NumberFormatter.format(Number((strategy.idle / (strategy.allocation || BigInt(1))) * BigInt(100)))} % */}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            0
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
    : <SpinningLogo />
}
