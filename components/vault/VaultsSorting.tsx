import PseudoRadioButton from "@/components/button/PseudoRadioButton";
import Image from "next/image";
import {useEffect, useMemo, useRef, useState} from "react";
import { ChainId, networkLogos, networkMap } from "@/lib/utils/connectors";
import PopUpModal from "../modal/PopUpModal";
import SwitchIcon from "@/components/svg/SwitchIcon";
interface NetworkFilterProps {
    supportedNetworks: ChainId[];
    selectNetwork: (chainId: ChainId) => void;
}

export default function VaultsSorting({className}: {className?: string}): JSX.Element {
    const [openFilter, setOpenSorting] = useState(false);
    const [activeNetwork, setActiveNetwork] = useState(ChainId.ALL);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const isLessThenMdScreenSize = useMemo(() => window.innerWidth < 1024, [window.innerWidth])

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
            { openFilter && !isLessThenMdScreenSize && (
                <div  ref={dropdownRef} className="xs:hidden md:block absolute w-[180px] p-[10px] border border-[#626263] top-16 bg-[#141416] rounded-lg right-0">
                    <button className="py-2 w-full cursor-pointer text-primary rounded-lg hover:bg-[#23262F] transition ease-in-out duration-250" onClick={toggleDropdown}>
                        Most TVL
                    </button>
                    <button className="py-2 w-full text-primary rounded-lg hover:bg-[#23262F] transition ease-in-out duration-250" onClick={toggleDropdown}>
                        Less TVL
                    </button>
                    <button className="py-2 w-full text-primary rounded-lg hover:bg-[#23262F] transition ease-in-out duration-250" onClick={toggleDropdown}>
                        Most vAPR
                    </button>
                    <button className="py-2 w-full text-primary rounded-lg hover:bg-[#23262F] transition ease-in-out duration-250" onClick={toggleDropdown}>
                        Less vAPR
                    </button>
                </div>
            ) }
            { isLessThenMdScreenSize && (
                <div className="no-select-dot absolute left-0 xs:block md:hidden">
                    <PopUpModal visible={openFilter} onClosePopUpModal={() => setOpenSorting(false)}>
                        <>
                            <p className="text-white mb-3 text-center">Select a sorting type</p>
                            <div className="space-y-4 w-full">
                                    <PseudoRadioButton label="Most TVL" handleClick={toggleDropdown} isActive/>
                                    <PseudoRadioButton label="Less TVL" handleClick={toggleDropdown} isActive={false}/>
                                    <PseudoRadioButton label="Most vAPR" handleClick={toggleDropdown} isActive={false}/>
                                    <PseudoRadioButton label="Less vAPR" handleClick={toggleDropdown} isActive={false}/>
                            </div>
                        </>
                    </PopUpModal>
                </div>
            ) }
        </div>
    );
}
