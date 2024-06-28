import PseudoRadioButton from "@/components/button/PseudoRadioButton";
import { useEffect, useMemo, useRef, useState } from "react";
import PopUpModal from "@/components/modal/PopUpModal";
import SwitchIcon from "@/components/svg/SwitchIcon";
import { VaultData } from "@/lib/types";

export enum VAULT_SORTING_TYPE {
  none = "none",
  mostTvl = "most-tvl",
  lessTvl = "less-tvl",
  mostvAPR = "most-apr",
  lessvAPR = "less-apr",
}

interface VaultSortingProps {
  className?: string;
  vaultState: [VaultData[], Function];
}

export default function VaultsSorting({
  className,
  vaultState,
}: VaultSortingProps): JSX.Element {
  const [vaults, setVaults] = vaultState;
  const [sortingType, setSortingType] = useState(VAULT_SORTING_TYPE.mostTvl);
  const [openFilter, setOpenSorting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLessThenMdScreenSize = useMemo(
    () => window.innerWidth < 1024,
    [window.innerWidth]
  );

  function sortVaults(sortType: VAULT_SORTING_TYPE) {
    setSortingType(sortType);
    // force update
    setVaults([...sort(sortType, vaults)]);
    setOpenSorting((prevState) => !prevState);
  }

  useEffect(() => {
    setVaults([...sort(sortingType, vaults)]);
    // apply sorting on initial load
  }, [vaults.length]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={(e) => {
          e.preventDefault();
          setOpenSorting((prevState) => !prevState);
        }}
        className="w-full h-14 py-4 px-6 gap-2 flex flex-row items-center justify-between rounded-lg border border-customGray500"
      >
        <div className="flex items-center">
          <p className="text-white">Sorting</p>
        </div>
        <SwitchIcon
          className="w-5 h-5 text-white"
          color={"#FFFFFF"}
          size={"21px"}
        />
      </button>
      {openFilter && !isLessThenMdScreenSize && (
        <div
          ref={dropdownRef}
          className="hidden md:flex flex-col absolute w-[180px] p-2 border border-customGray500 top-16 bg-customNeutral300 rounded-lg right-0"
        >
          <button
            className={`
                            py-2 w-full
                            cursor-pointer
                            text-white
                            rounded-lg
                            hover:bg-customNeutral200
                            transition
                            ease-in-out
                            duration-250
                            ${
                              sortingType === VAULT_SORTING_TYPE.mostTvl
                                ? "bg-customNeutral100"
                                : "bg-customNeutral300"
                            }
                        `}
            onClick={() => sortVaults(VAULT_SORTING_TYPE.mostTvl)}
          >
            Most TVL
          </button>
          <button
            className={`
                            py-2 w-full
                            text-white
                            rounded-lg
                            hover:bg-customNeutral200
                            transition
                            ease-in-out
                            duration-250
                            ${
                              sortingType === VAULT_SORTING_TYPE.lessTvl
                                ? "bg-customNeutral100"
                                : "bg-customNeutral300"
                            }
                        `}
            onClick={() => sortVaults(VAULT_SORTING_TYPE.lessTvl)}
          >
            Less TVL
          </button>
          <button
            className={`
                            py-2 w-full
                            text-white
                            rounded-lg
                            hover:bg-customNeutral200
                            transition
                            ease-in-out
                            duration-250
                            ${
                              sortingType === VAULT_SORTING_TYPE.mostvAPR
                                ? "bg-customNeutral100"
                                : "bg-customNeutral300"
                            }
                        `}
            onClick={() => sortVaults(VAULT_SORTING_TYPE.mostvAPR)}
          >
            Most vAPY
          </button>
          <button
            className={`
                            py-2
                            w-full
                            text-white
                            rounded-lg
                            hover:bg-customNeutral200
                            transition
                            ease-in-out
                            duration-250
                            ${
                              sortingType === VAULT_SORTING_TYPE.lessvAPR
                                ? "bg-customNeutral100"
                                : "bg-customNeutral300"
                            }
                        `}
            onClick={() => sortVaults(VAULT_SORTING_TYPE.lessvAPR)}
          >
            Less vAPY
          </button>
        </div>
      )}
      {isLessThenMdScreenSize && (
        <div className="no-select-dot absolute left-0 block md:hidden">
          <PopUpModal
            visible={openFilter}
            onClosePopUpModal={() => setOpenSorting(false)}
          >
            <>
              <p className="text-white mb-3 text-center">
                Select a sorting type
              </p>
              <div className="space-y-4 w-full">
                <PseudoRadioButton
                  label="Most TVL"
                  handleClick={() => sortVaults(VAULT_SORTING_TYPE.mostTvl)}
                  isActive={sortingType === VAULT_SORTING_TYPE.mostTvl}
                />
                <PseudoRadioButton
                  label="Less TVL"
                  handleClick={() => sortVaults(VAULT_SORTING_TYPE.lessTvl)}
                  isActive={sortingType === VAULT_SORTING_TYPE.lessTvl}
                />
                <PseudoRadioButton
                  label="Most vAPR"
                  handleClick={() => sortVaults(VAULT_SORTING_TYPE.mostvAPR)}
                  isActive={sortingType === VAULT_SORTING_TYPE.mostvAPR}
                />
                <PseudoRadioButton
                  label="Less vAPR"
                  handleClick={() => sortVaults(VAULT_SORTING_TYPE.lessvAPR)}
                  isActive={sortingType === VAULT_SORTING_TYPE.lessvAPR}
                />
              </div>
            </>
          </PopUpModal>
        </div>
      )}
    </div>
  );
}

export function sort(sortType: VAULT_SORTING_TYPE, vaults: VaultData[]) {
  switch (sortType) {
    case VAULT_SORTING_TYPE.mostTvl:
      return vaults.sort((a, b) => b.tvl - a.tvl);
    case VAULT_SORTING_TYPE.lessTvl:
      return vaults.sort((a, b) => a.tvl - b.tvl);
    case VAULT_SORTING_TYPE.mostvAPR:
      return vaults.sort((a, b) => b.totalApy - a.totalApy);
    case VAULT_SORTING_TYPE.lessvAPR:
      return vaults.sort((a, b) => a.totalApy - b.totalApy);
    default:
      return vaults;
  }
}
