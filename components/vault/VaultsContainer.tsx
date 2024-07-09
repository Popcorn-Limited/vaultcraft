import NoSSR from "react-no-ssr";
import { Fragment, useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import useNetworkFilter from "@/lib/useNetworkFilter";
import NetworkFilter from "@/components/network/NetworkFilter";
import MainActionButton from "@/components/button/MainActionButton";
import { useAtom } from "jotai";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { OptionTokenByChain, VCX } from "@/lib/constants";
import Modal from "@/components/modal/Modal";
import OptionTokenInterface from "@/components/optionToken/OptionTokenInterface";
import type { AddressesByChain, VaultData } from "@/lib/types";
import {
  gaugeRewardsAtom,
  networthAtom,
  tokensAtom,
  tvlAtom,
} from "@/lib/atoms";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import OptionTokenExerciseModal from "@/components/optionToken/exercise/OptionTokenExerciseModal";
import useIsBreakPoint from "@/lib/useIsMobile";
import VaultCard from "./VaultCard";

import SearchBar from "@/components/input/SearchBar";
import VaultsSorting from "@/components/vault/VaultsSorting";
import VaultsTable from "./VaultsTable";
import LargeCardStat from "@/components/common/LargeCardStat";

interface VaultsContainerProps {
  hiddenVaults: AddressesByChain;
  displayVaults: AddressesByChain;
}

export default function VaultsContainer({
  hiddenVaults,
  displayVaults,
}: VaultsContainerProps): JSX.Element {
  const [vaultsData] = useAtom(vaultsAtom);
  const [vaults, setVaults] = useState<VaultData[]>([]);

  useEffect(() => {
    if (Object.keys(vaultsData).length > 0 && vaults.length === 0) {
      setVaults(SUPPORTED_NETWORKS.map((chain) => vaultsData[chain.id]).flat());
    }
  }, [vaultsData, vaults]);

  const [tvl] = useAtom(tvlAtom);
  const [networth] = useAtom(networthAtom);
  const [tokens] = useAtom(tokensAtom);
  const [gaugeRewards] = useAtom(gaugeRewardsAtom);

  const [selectedNetworks, selectNetwork] = useNetworkFilter(
    SUPPORTED_NETWORKS.map((network) => network.id)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showOptionTokenModal, setShowOptionTokenModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  function handleSearch(value: string) {
    setSearchTerm(value);
  }

  return Object.keys(tokens).length > 0 ? (
    <NoSSR >
      <Modal visibility={[showOptionTokenModal, setShowOptionTokenModal]}>
        <OptionTokenInterface />
      </Modal>
      <OptionTokenExerciseModal show={[showExerciseModal, setShowExerciseModal]} />
      <section className="md:border-b border-customNeutral100 md:flex md:flex-row items-top justify-between py-4 md:py-10 px-4 md:px-0 md:gap-4">
        <div className="w-full md:w-max">
          <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-white md:text-3xl leading-none">
            Smart Vaults
          </h1>
          <p className="text-customGray100 md:text-white md:opacity-80">
            Automate your returns in single-asset deposit yield strategies.
          </p>
        </div>

        <div className="w-full justify-end lg:w-8/12 md:flex md:flex-row space-y-4 md:space-y-0 mt-4 md:mt-0">
          <div className="flex flex-row items-center md:pr-4 gap-8 md:w-fit">
            <div className="w-[120px] md:w-max">
              <LargeCardStat
                id="total-tvl"
                label="TVL"
                value={`$${tvl.vault < 1 ? "0" : NumberFormatter.format(tvl.vault)}`}
                tooltip="Total value locked (TVL) is the amount of user funds deposited in Smart Vaults."
              />
            </div>

            <div className="w-[120px] md:w-max">
              <LargeCardStat
                id="total-deposits"
                label="Deposits"
                value={`$${networth.vault < 1 ? "0" : NumberFormatter.format(networth.vault)}`}
                tooltip="Value of your smart vault deposits across all blockchains."
              />
            </div>
          </div>

          <div className="flex flex-row items-center md:gap-4 md:w-fit md:pl-4">
            <div className="flex gap-8 w-fit">
              <div className="w-[120px] md:w-max">
                <LargeCardStat
                  id="total-my-ovcx"
                  label="My oVCX"
                  value={`$${tokens[1][OptionTokenByChain[1]].balance && tokens[1] && tokens[1][VCX]
                    ? NumberFormatter.format(
                      (tokens[1][OptionTokenByChain[1]].balance / 1e18) * (tokens[1][VCX].price * 0.25)
                    )
                    : "0"
                    }`}
                  tooltip="Value of oVCX held in your wallet across all blockchains."
                />

              </div>

              <div className="w-[120px] md:w-max">
                <LargeCardStat
                  id="total-claimable-ovcx"
                  label="Claimable oVCX"
                  value={`$${gaugeRewards && tokens[1] && tokens[1][VCX]
                    ? NumberFormatter.format(
                      (Number(gaugeRewards?.[1]?.total + gaugeRewards?.[10]?.total + gaugeRewards?.[42161]?.total || 0) / 1e18) *
                      (tokens[1][VCX].price * 0.25)
                    )
                    : "0"
                    }`}
                  tooltip="Cumulative value of claimable oVCX from vaults across all blockchains."
                />
              </div>
            </div>
          </div>
          <div className="w-full md:w-40 space-y-2 md:ml-4">
            <MainActionButton
              label="Claim oVCX"
              handleClick={() => setShowOptionTokenModal(true)}
            />
            <SecondaryActionButton
              label="Exercise oVCX"
              handleClick={() => setShowExerciseModal(true)}
            />
          </div>
        </div>
      </section>

      <div className="md:hidden">
        <nav className="px-5 [&_>*]:shrink-0 mt-8 [&_.my-10]:my-0 whitespace-nowrap flex flex-col smmd:flex-row gap-4 mb-10">
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
        <section className="px-4 gap-6 md:gap-10 grid smmd:grid-cols-2">
          {vaults
            .filter(
              (vault) => searchTerm.length > 0 || selectedNetworks.includes(vault.chainId)
            )
            .filter((vault) =>
              Object.keys(displayVaults).length > 0
                ? displayVaults[vault.chainId].includes(vault.address)
                : !hiddenVaults[vault.chainId].includes(vault.address)
            ).map((vaultData) => (
              <VaultCard
                {...vaultData}
                key={`sm-mb-${vaultData.address}`}
                searchTerm={searchTerm}
              />
            ))}
        </section>
      </div>

      <div className="hidden md:block">
        <VaultsTable
          vaults={vaults
            .filter(
              (vault) => searchTerm.length > 0 || selectedNetworks.includes(vault.chainId)
            )
            .filter((vault) =>
              Object.keys(displayVaults).length > 0
                ? displayVaults[vault.chainId].includes(vault.address)
                : !hiddenVaults[vault.chainId].includes(vault.address)
            )}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSelectNetwork={selectNetwork}
        />
      </div>
    </NoSSR >
  )
    : <p className="text-white">Loading...</p>
}
