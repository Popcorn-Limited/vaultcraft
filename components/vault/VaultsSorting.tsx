import PseudoRadioButton from "@/components/button/PseudoRadioButton";
import { useMemo, useRef, useState } from "react";
import PopUpModal from "@/components/modal/PopUpModal";
import SwitchIcon from "@/components/svg/SwitchIcon";
import { LockVaultData, VaultData } from "@/lib/types";

export enum VAULT_SORTING_TYPE {
    none = 'none',
    mostTvl = 'most-tvl',
    lessTvl = 'less-tvl',
    mostvAPR = 'most-apr',
    lessvAPR = 'less-apr'
}

interface VaultSortingProps {
    className?: string;
    vaultState: [VaultData[] | LockVaultData[], Function];
}

export default function VaultsSorting({ className, vaultState }: VaultSortingProps): JSX.Element {
    const [vaults, setVaults] = vaultState;
    const [sortingType, setSortingType] = useState(VAULT_SORTING_TYPE.mostTvl)
    const [openFilter, setOpenSorting] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const isLessThenMdScreenSize = useMemo(() => window.innerWidth < 1024, [window.innerWidth])

    function sortVaults(sortType: VAULT_SORTING_TYPE) {
        setVaults(sort(sortType, [...vaults]))
        setSortingType(sortType)
        setOpenSorting(prevState => !prevState)
    }

    function sort(sortType: VAULT_SORTING_TYPE, vaults: VaultData[] | LockVaultData[]) {
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
                return vaults
        }
    }

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setOpenSorting(prevState => !prevState);
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
                            ${sortingType === VAULT_SORTING_TYPE.mostTvl ? 'bg-[#353945]' : 'bg-[#141416]'}
                        `}
                        onClick={() => sortVaults(VAULT_SORTING_TYPE.mostTvl)}
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
                            ${sortingType === VAULT_SORTING_TYPE.lessTvl ? 'bg-[#353945]' : 'bg-[#141416]'}
                        `}
                        onClick={() => sortVaults(VAULT_SORTING_TYPE.lessTvl)}
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
                            ${sortingType === VAULT_SORTING_TYPE.mostvAPR ? 'bg-[#353945]' : 'bg-[#141416]'}
                        `}
                        onClick={() => sortVaults(VAULT_SORTING_TYPE.mostvAPR)}
                    >
                        Most vAPY
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
                            ${sortingType === VAULT_SORTING_TYPE.lessvAPR ? 'bg-[#353945]' : 'bg-[#141416]'}
                        `}
                        onClick={() => sortVaults(VAULT_SORTING_TYPE.lessvAPR)}
                    >
                        Less vAPY
                    </button>
                </div>
            )}
            {isLessThenMdScreenSize && (
                <div className="no-select-dot absolute left-0 block md:hidden">
                    <PopUpModal visible={openFilter} onClosePopUpModal={() => setOpenSorting(false)}>
                        <>
                            <p className="text-white mb-3 text-center">Select a sorting type</p>
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
