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
import { GoSearch } from "react-icons/go";
import { MdClose } from "react-icons/md";
import VaultRow from "./VaultRow";

interface VaultsContainerProps {
  hiddenVaults: AddressesByChain;
  displayVaults: AddressesByChain;
}

export default function VaultsContainer({
  hiddenVaults,
  displayVaults,
}: VaultsContainerProps): JSX.Element {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const { address: account } = useAccount();

  const [vaultsData] = useAtom(vaultsAtom);
  const [vaults, setVaults] = useState<VaultData[]>([]);

  useEffect(() => {
    if (Object.keys(vaultsData).length > 0)
      setVaults(SUPPORTED_NETWORKS.map((chain) => vaultsData[chain.id]).flat());
  }, [vaultsData]);

  const [tvl] = useAtom(tvlAtom);
  const [networth] = useAtom(networthAtom);
  const [tokens] = useAtom(tokensAtom);
  const [gaugeRewards] = useAtom(gaugeRewardsAtom);

  const { data: oBal } = useBalance({
    chainId: 1,
    address: account,
    token: OptionTokenByChain[1],
    watch: true,
  });

  const [selectedNetworks, selectNetwork] = useNetworkFilter(
    SUPPORTED_NETWORKS.map((network) => network.id)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showOptionTokenModal, setShowOptionTokenModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  function handleSearch(value: string) {
    setSearchTerm(value);
  }

  const SHOW_INPUT_SEARCH = showSearchInput || searchTerm.length > 0;

  return (
    <NoSSR>
      <Modal visibility={[showOptionTokenModal, setShowOptionTokenModal]}>
        <OptionTokenInterface />
      </Modal>
      <OptionTokenExerciseModal
        show={[showExerciseModal, setShowExerciseModal]}
      />
      <section className="md:border-b border-customNeutral100 md:flex md:flex-row items-center justify-between py-10 px-4 md:px-8 md:gap-4">
        <div className="w-full md:w-max">
          <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-white md:text-3xl leading-none">
            Smart Vaults
          </h1>
          <p className="text-customGray100 md:text-white md:opacity-80 max-w-xs">
            Automate your returns in single-asset deposit yield strategies.
          </p>
        </div>

        <div className="w-full lg:justify-end lg:w-8/12 md:divide-x md:flex md:flex-row space-y-4 md:space-y-0 mt-4 md:mt-0">
          <div className="flex flex-row items-center md:pr-10 gap-10 md:w-fit">
            <div className="w-[120px] md:w-max">
              <p className="leading-6 text-base text-customGray100 md:text-white">
                TVL
              </p>
              <div className="text-3xl font-bold whitespace-nowrap text-white">
                {`$${NumberFormatter.format(tvl.vault)}`}
              </div>
            </div>

            <div className="w-[120px] md:w-max">
              <p className="leading-6 text-base text-customGray100 md:text-white">
                Deposits
              </p>
              <div className="text-3xl font-bold whitespace-nowrap text-white">
                {`$${NumberFormatter.format(networth.vault)}`}
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center md:gap-6 md:w-fit md:pl-12">
            <div className="flex gap-10 w-fit">
              <div className="w-[120px] md:w-max">
                <p className="w-max leading-6 text-base text-customGray100 md:text-white">
                  My oVCX
                </p>
                <div className="w-max text-3xl font-bold whitespace-nowrap text-white">
                  {`$${
                    oBal && tokens[1] && tokens[1][VCX]
                      ? NumberFormatter.format(
                          (Number(oBal?.value) / 1e18) *
                            (tokens[1][VCX].price * 0.25)
                        )
                      : "0"
                  }`}
                </div>
              </div>

              <div className="w-[120px] md:w-max">
                <p className="w-max leading-6 text-base text-customGray100 md:text-white">
                  Claimable oVCX
                </p>
                <div className="w-max text-3xl font-bold whitespace-nowrap text-white">
                  {`$${
                    gaugeRewards && tokens[1] && tokens[1][VCX]
                      ? NumberFormatter.format(
                          (Number(
                            gaugeRewards?.[1]?.total +
                              gaugeRewards?.[10]?.total +
                              gaugeRewards?.[42161]?.total || 0
                          ) /
                            1e18) *
                            (tokens[1][VCX].price * 0.25)
                        )
                      : "0"
                  }`}
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-row items-center w-100 space-x-4">
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
          <div className="md:hidden space-y-4">
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

      <section className="text-white mt-12 w-full border rounded-xl overflow-hidden border-customNeutral100">
        <table className="w-full [&_td]:h-20 [&_th]:h-18 [&_td]:px-5 [&_th]:px-5">
          <thead className="bg-customNeutral200 border-b border-customNeutral100">
            <tr>
              <th>
                <nav className="flex relative gap-3 [&_button:not(.bg-opacity-20)]:bg-opacity-0 [&_button:not(.bg-opacity-20)]:border-customGray100/40 [&_button:hover]:border-primaryYellow [&_button]:rounded-full [&_img]:w-5 [&_button]:px-5 [&_button]:py-2">
                  <fieldset
                    onBlurCapture={() => setShowSearchInput(false)}
                    onClick={() => setShowSearchInput(true)}
                    role="button"
                  >
                    <button className="w-12 pointer-events-none h-10 grid place-items-center border !p-0 !rounded-lg">
                      <GoSearch className="scale-110" />
                    </button>

                    {SHOW_INPUT_SEARCH && (
                      <Fragment>
                        <div className="absolute pointer-events-none w-12 z-[1] top-1/2 left-0 -translate-y-1/2 grid place-items-center">
                          <GoSearch className="scale-110" />
                        </div>

                        <input
                          autoFocus
                          value={searchTerm}
                          placeholder="Search"
                          onInput={(e) => handleSearch(e.currentTarget.value)}
                          className="absolute pl-14 pr-4 font-normal inset-0 border outline-none border-customGray100/40 rounded-lg bg-customNeutral200"
                          type="text"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchTerm("");
                            setShowSearchInput(false);
                          }}
                          className="absolute z-[1] flex items-center h-full !p-0 w-8 top-0 right-0"
                        >
                          <MdClose className="text-xl scale-105" />
                        </button>
                      </Fragment>
                    )}
                  </fieldset>

                  <NetworkFilter
                    supportedNetworks={SUPPORTED_NETWORKS.map(
                      (chain) => chain.id
                    )}
                    selectNetwork={selectNetwork}
                  />
                </nav>
              </th>
              <th className="font-normal text-right whitespace-nowrap">
                Your Wallet
              </th>
              <th className="font-normal text-right whitespace-nowrap">
                Your Deposit
              </th>
              <th className="font-normal text-right">TVL</th>
              <th className="font-normal text-right">vAPR</th>
              <th className="font-normal text-right whitespace-nowrap">
                Min Rewards APY
              </th>
              <th className="font-normal text-right whitespace-nowrap">
                Max Rewards APY
              </th>
              <th className="font-normal text-right">Boost</th>
            </tr>
          </thead>
          <tbody>
            {vaults
              .filter(
                (vault) =>
                  SHOW_INPUT_SEARCH || selectedNetworks.includes(vault.chainId)
              )
              .filter((vault) =>
                Object.keys(displayVaults).length > 0
                  ? displayVaults[vault.chainId].includes(vault.address)
                  : !hiddenVaults[vault.chainId].includes(vault.address)
              )
              .sort((a, b) => b.tvl - a.tvl)
              .map((vaultData, i) => (
                <VaultRow
                  {...vaultData}
                  searchTerm={searchTerm}
                  key={`item-${i}`}
                />
              ))}
          </tbody>
        </table>
      </section>
    </NoSSR>
  );
}
