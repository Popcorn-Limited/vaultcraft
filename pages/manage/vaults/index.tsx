import NetworkFilter from "@/components/network/NetworkFilter";
import AssetWithName from "@/components/vault/AssetWithName";
import VaultStats from "@/components/vault/VaultStats";
import { vaultsAtom } from "@/lib/atoms/vaults";
import useNetworkFilter from "@/lib/useNetworkFilter";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useState } from "react";
import NoSSR from "react-no-ssr";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export default function ManageVault() {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const router = useRouter();

  const [vaults, setVaults] = useAtom(vaultsAtom);

  const [selectedNetworks, selectNetwork] = useNetworkFilter(
    SUPPORTED_NETWORKS.map((network) => network.id)
  );
  const [searchString, handleSearch] = useState("");

  return (
    <NoSSR>
      <section className="mt-8 mb-10 md:mb-6 md:my-10 md:flex px-4 md:px-8 flex-row items-center justify-between">
        <NetworkFilter
          supportedNetworks={SUPPORTED_NETWORKS.map((chain) => chain.id)}
          selectNetwork={selectNetwork}
        />
        <div className="flex gap-4 justify-between md:justify-end">
          <div className="md:w-96 flex px-6 py-3 items-center rounded-lg border border-gray-300 border-opacity-40 group/search hover:border-opacity-80 gap-2 md:mt-6 mt-12 mb-6 md:my-0">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400 group-hover/search:text-gray-200" />
            <input
              className="w-10/12 md:w-80 focus:outline-none border-0 text-gray-500 focus:text-gray-200 leading-none bg-transparent"
              type="text"
              placeholder="Search..."
              onChange={(e) => handleSearch(e.target.value.toLowerCase())}
              defaultValue={searchString}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8">
        {vaults.length > 0 && account ? (
          vaults
            .filter((vault) => selectedNetworks.includes(vault.chainId))
            .filter((vault) => vault.metadata.creator === account)
            .map((vault) => {
              return (
                <div
                  key={`${vault.chainId}-${vault.address}`}
                  className="w-full flex flex-wrap items-center justify-between flex-col gap-4 px-8 pt-6 pb-5 rounded-3xl border border-[#353945] group hover:bg-[#23262f] [&_summary::-webkit-details-marker]:hidden cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/manage/vaults/${vault.address}?chainId=${vault.chainId}`
                    )
                  }
                >
                  <div className="flex items-center justify-between select-none w-full">
                    <AssetWithName vault={vault} />
                  </div>

                  <VaultStats
                    vaultData={vault}
                    account={account}
                    zapAvailable={false}
                  />
                </div>
              );
            })
        ) : (
          <p className="text-white">Loading Vaults...</p>
        )}
      </section>
    </NoSSR>
  );
}
