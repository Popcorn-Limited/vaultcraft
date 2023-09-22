import { useMemo } from "react";
import Link from "next/link";
import { useNetwork, useAccount } from "wagmi";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { networkLogos } from "@/lib/connectors";
import MainActionButton from "@/components/buttons/MainActionButton";

export default function DesktopMenu(): JSX.Element {
    const { openConnectModal } = useConnectModal();
    const { openChainModal } = useChainModal();
    const { address } = useAccount();
    const { chain, chains } = useNetwork();
    
    // @ts-ignore
    const logo = useMemo(() => (address && chain?.id ? networkLogos[chain.id] : networkLogos["1"]), [chain?.id, address]);
    const chainName = useMemo(() => (address && chain?.name ? chain.name : "Ethereum"), [chain?.id, address]);


    return (
        <div className="bg-transparent w-full">
            <div className="flex flex-row items-center justify-between w-full md:p-[36px] p-6 z-30 border-b-[#353945] border-b-[1px]">
                <div className="flex flex-row items-center">
                    <div>
                        <Link href={`/`} passHref>
                            <img src="/images/icons/popLogo.svg" alt="Logo" className="w-10 h-10" />
                        </Link>
                    </div>
                </div>
                <div className="flex h-full flex-row w-fit-content gap-x-6">
                    {address ? (
                        <div className={`relative flex flex-row z-10`}>
                            <div
                                className={`w-fit cursor-pointer h-full py-3 md:px-6 flex md:flex-row flex-row-reverse items-center justify-between border border-[#d7d7d766] md:rounded-[4px] rounded-[30px]  text-primary`}
                                onClick={openChainModal}
                            >
                                <img src={logo} alt={chainName} className="w-5 h-5 md:mr-3 mr-1" />
                                <div className="w-[1px] h-full bg-white md:flex hidden" />
                                <p className="ml-3 text-customLightGray md:flex hidden leading-none">{address?.substring(0, 5)}...</p>
                                <ChevronDownIcon className="w-5 h-5 md:ml-6 ml-3 text-customLightGray" aria-hidden="true" />
                            </div>
                        </div>
                    ) : (
                        <MainActionButton label="Connect Wallet" handleClick={openConnectModal} hidden={address ? true : false} />
                    )}
                </div>
            </div>
        </div>
    );
}
