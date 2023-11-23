import PseudoRadioButton from "@/components/button/PseudoRadioButton";
import {useMemo, useRef, useState } from "react";
import PopUpModal from "../modal/PopUpModal";
import SwitchIcon from "@/components/svg/SwitchIcon";

export enum VAULT_SORTING_TYPE {
    none = 'none',
    mostTvl = 'most-tvl',
    lessTvl = 'less-tvl',
    mostvAPR = 'most-apr',
    lessvAPR = 'less-apr'
  }

interface VaultSortingProps {
    className?: string,
    currentSortingType: VAULT_SORTING_TYPE,
    sortByMostTvl: () => void,
    sortByLessTvl: () => void
    sortByMostApy: () => void,
    sortByLessApy: () => void
}

export default function VaultsSorting(
    {
        className,
        currentSortingType,
        sortByMostTvl,
        sortByLessTvl,
        sortByMostApy,
        sortByLessApy,
    }: VaultSortingProps): JSX.Element {
    const [openFilter, setOpenSorting] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const isLessThenMdScreenSize = useMemo(() => window.innerWidth < 1024, [window.innerWidth])

    const sortingLessTvl = ()  => {
        sortByLessTvl()
        toggleDropdown()
    }

    const sortingMostTvl = ()  => {
        sortByMostTvl()
        toggleDropdown()
    }

    const sortingLessApy = ()  => {
        sortByLessApy()
        toggleDropdown()
    }

    const sortingMostApy = ()  => {
        sortByMostApy()
        toggleDropdown()
    }

    const toggleDropdown = () => {
        setOpenSorting(prevState => !prevState)
    }

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown();
                }}
                className="w-full h-[58px] py-[14px] px-6 gap-2 flex flex-row items-center justify-between rounded-lg border border-[#626263]"
            >
                <div className="flex items-center">
                    <p className="text-primary">Sorting</p>
                </div>
                <SwitchIcon className="w-5 h-5 text-primary" color={"#FFFFFF"} size={"21px"} />
            </button>
            {openFilter && !isLessThenMdScreenSize && (
                <div ref={dropdownRef} className="hidden md:block absolute w-[180px] p-[10px] border border-[#626263] top-16 bg-[#141416] rounded-lg right-0">
                    <button
                        className={`
                            py-2 w-full 
                            cursor-pointer
                            text-primary 
                            rounded-lg 
                            hover:bg-[#23262F] 
                            transition 
                            ease-in-out 
                            duration-250 
                            ${currentSortingType === VAULT_SORTING_TYPE.mostTvl ? 'bg-[#353945]': 'bg-[#141416]'}
                        `}
                        onClick={sortingMostTvl}
                    >
                        Most TVL
                    </button>
                    <button
                        className={`
                            py-2 w-full
                            text-primary 
                            rounded-lg 
                            hover:bg-[#23262F] 
                            transition 
                            ease-in-out 
                            duration-250
                            ${currentSortingType === VAULT_SORTING_TYPE.lessTvl ? 'bg-[#353945]': 'bg-[#141416]'}
                        `}
                        onClick={sortingLessTvl}
                    >
                        Less TVL
                    </button>
                    <button
                        className={`
                            py-2 w-full 
                            text-primary 
                            rounded-lg 
                            hover:bg-[#23262F] 
                            transition 
                            ease-in-out 
                            duration-250
                            ${currentSortingType === VAULT_SORTING_TYPE.mostvAPR ? 'bg-[#353945]': 'bg-[#141416]'}
                        `}
                        onClick={sortingMostApy}
                    >
                        Most vAPR
                    </button>
                    <button
                        className={`
                            py-2 
                            w-full 
                            text-primary 
                            rounded-lg 
                            hover:bg-[#23262F] 
                            transition 
                            ease-in-out 
                            duration-250
                            ${currentSortingType === VAULT_SORTING_TYPE.lessvAPR ? 'bg-[#353945]': 'bg-[#141416]'}
                        `}
                        onClick={sortingLessApy}
                    >
                        Less vAPR
                    </button>
                </div>
            )}
            {isLessThenMdScreenSize && (
                <div className="no-select-dot absolute left-0 block md:hidden">
                    <PopUpModal visible={openFilter} onClosePopUpModal={() => setOpenSorting(false)}>
                        <>
                            <p className="text-white mb-3 text-center">Select a sorting type</p>
                            <div className="space-y-4 w-full">
                                <PseudoRadioButton label="Most TVL" handleClick={sortingMostTvl} isActive={currentSortingType === VAULT_SORTING_TYPE.mostTvl} />
                                <PseudoRadioButton label="Less TVL" handleClick={sortingLessTvl} isActive={currentSortingType === VAULT_SORTING_TYPE.lessTvl} />
                                <PseudoRadioButton label="Most vAPR" handleClick={sortingMostApy} isActive={currentSortingType === VAULT_SORTING_TYPE.mostvAPR} />
                                <PseudoRadioButton label="Less vAPR" handleClick={sortingLessApy} isActive={currentSortingType === VAULT_SORTING_TYPE.lessvAPR} />
                            </div>
                        </>
                    </PopUpModal>
                </div>
            )}
        </div>
    );
}
