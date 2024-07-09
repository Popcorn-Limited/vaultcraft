import { Fragment, useState } from "react";
import { ChainId, SUPPORTED_NETWORKS } from "@/lib/utils/connectors";

import NetworkFilter from "@/components/network/NetworkFilter";
import type { VaultData } from "@/lib/types";

import { cn } from "@/lib/utils/helpers";
import { GoSearch } from "react-icons/go";
import { MdClose } from "react-icons/md";
import { TiArrowUnsorted } from "react-icons/ti";

import VaultRow from "./VaultRow";
import { VAULT_SORTING_TYPE, sort } from "./VaultsSorting";
import { WithTooltip } from "@/components/common/Tooltip";

export default function VaultsTable({
  vaults,
  searchTerm,
  onSearchTermChange,
  onSelectNetwork,
}: {
  vaults: VaultData[];
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  onSelectNetwork: (chainId: ChainId) => void;
}): JSX.Element {
  const [sorting, setSorting] = useState<VAULT_SORTING_TYPE>(
    VAULT_SORTING_TYPE.mostTvl
  );

  const [showSearchInput, setShowSearchInput] = useState(false);

  const SHOW_INPUT_SEARCH = showSearchInput || searchTerm.length > 0;

  console.log(vaults)

  return (
    <section className="text-white mt-12 w-full border rounded-xl overflow-hidden border-customNeutral100">
      <table className="w-full [&_td]:h-20 [&_th]:h-18 [&_td]:px-5 [&_th]:px-5">
        <thead className="bg-customNeutral200 border-b border-customNeutral100">
          <tr>
            <th>
              <nav className="flex [&_.space-x-2]:shrink-0 relative gap-3 [&_button:not(.bg-opacity-20)]:bg-opacity-0 [&_button:not(.bg-opacity-20)]:border-customGray100/40 [&_button:hover]:border-primaryYellow [&_button]:rounded-full [&_img]:w-5 [&_button]:px-5 [&_button]:py-2">
                <fieldset
                  onBlurCapture={() => setShowSearchInput(false)}
                  onClick={() => setShowSearchInput(true)}
                  role="button"
                >
                  <button className="w-12 pointer-events-none h-11 grid place-items-center border !p-0 !rounded-lg">
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
                        onInput={(e) =>
                          onSearchTermChange(e.currentTarget.value)
                        }
                        className="absolute pl-14 pr-4 font-normal inset-0 border outline-none border-customGray100/40 rounded-lg bg-customNeutral200"
                        type="text"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSearchTermChange("");
                          setShowSearchInput(false);
                        }}
                        className="absolute z-[1] flex items-center h-full !p-0 w-8 top-0 right-0"
                      >
                        <MdClose className="text-xl scale-105" />
                      </button>
                    </Fragment>
                  )}
                </fieldset>

                <div
                  className={cn(
                    "flex items-center",
                    SHOW_INPUT_SEARCH && "opacity-0 pointer-events-none"
                  )}
                >
                  <NetworkFilter
                    supportedNetworks={SUPPORTED_NETWORKS.map(
                      (chain) => chain.id
                    )}
                    selectNetwork={onSelectNetwork}
                  />
                </div>
              </nav>
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.yourWallet}
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.yourDeposit}
            </th>
            <th className="font-normal text-right">
              <button
                onClick={() => {
                  setSorting(
                    sorting === VAULT_SORTING_TYPE.mostTvl
                      ? VAULT_SORTING_TYPE.lessTvl
                      : VAULT_SORTING_TYPE.mostTvl
                  );
                }}
                className="flex items-center gap-1"
              >
                {LABELS_WITH_TOOLTIP.tvl}
                <TiArrowUnsorted className="mb-0.5" />
              </button>
            </th>
            <th className="font-normal text-right">
              <button
                onClick={() => {
                  setSorting(
                    sorting === VAULT_SORTING_TYPE.mostvAPR
                      ? VAULT_SORTING_TYPE.lessvAPR
                      : VAULT_SORTING_TYPE.mostvAPR
                  );
                }}
                className="flex items-center gap-1"
              >
                {LABELS_WITH_TOOLTIP.vAPR}
                <TiArrowUnsorted className="mb-0.5" />
              </button>
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.minRewardsAPY}
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.maxRewardsAPY}
            </th>
            <th className="font-normal text-right">
              {LABELS_WITH_TOOLTIP.boost}
            </th>
          </tr>
        </thead>
        <tbody>
          {vaults.length === 0 && (
            <tr>
              <td className="text-center" colSpan={8}>
                Loading vaults...
              </td>
            </tr>
          )}

          {sort(sorting, vaults).map((vaultData, i) => (
            <VaultRow
              {...vaultData}
              searchTerm={searchTerm}
              key={`item-${i}`}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

export const LABELS_WITH_TOOLTIP = {
  tvl: (
    <WithTooltip content="Total value of all assets deposited into the vault">
      TVL
    </WithTooltip>
  ),
  yourWallet: (
    <WithTooltip content="Value of deposit assets held in your wallet">
      Your Wallet
    </WithTooltip>
  ),
  yourDeposit: (
    <WithTooltip content="Value of your vault deposits">
      Your Deposit
    </WithTooltip>
  ),
  vAPR: (
    <WithTooltip content="Current Variable APR of the vault">
      vAPR
    </WithTooltip>
  ),
  minRewardsAPY: (
    <WithTooltip content="Minimum oVCX boost APR based on most current epoch's distribution">
      Min Boost
    </WithTooltip>
  ),
  maxRewardsAPY: (
    <WithTooltip content="Maximum oVCX boost APR based on most current epoch's distribution">
      Max Boost
    </WithTooltip>
  ),
  boost: (
    <WithTooltip content="Current APR Boost for this vault">
      Your Boost
    </WithTooltip>
  ),
};
