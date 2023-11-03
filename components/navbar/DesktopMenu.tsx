import { useMemo } from "react";
import Link from "next/link";
import { useNetwork, useAccount } from "wagmi";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { networkLogos } from "@/lib/connectors";
import MainActionButton from "@/components/buttons/MainActionButton";
import { useRouter } from "next/router";
import SecondaryActionButton from "../buttons/SecondaryActionButton";

export default function DesktopMenu(): JSX.Element {
    const router = useRouter();
    const { openConnectModal } = useConnectModal();
    const { openChainModal } = useChainModal();
    const { address } = useAccount();
    const { chain, chains } = useNetwork();

    const logo = useMemo(() => (address && chain?.id ? networkLogos[chain.id] : networkLogos["1"]), [chain?.id, address]);
    const chainName = useMemo(() => (address && chain?.name ? chain.name : "Ethereum"), [chain?.id, address]);

    function directToVaults() {
        router.push("https://app.pop.network/vaults")
    }

    return (
        <div className="bg-transparent w-full">
            <div className="flex flex-row items-center justify-between w-full md:p-[36px] p-6 z-30 border-b-[#353945] border-b-[1px]">
                <div className="w-1/3">
                    <div>
                        <Link href={`/`} passHref>
                            <img src="/images/icons/popLogo.svg" alt="Logo" className="w-10 h-10" />
                        </Link>
                    </div>
                </div>

                <div className="hidden md:block w-1/3">
                    <p className="text-white">
                        VaultCraft uses novel technology and is experimental software.
                        You might encounter some bugs. If you have questions text us here in {" "}
                        <a href="https://discord.gg/n46dDQ5G" className="text-blue-500">Discord</a>.
                    </p>
                </div>

                <div className="flex flex-row justify-end h-full w-1/3 md:w gap-x-3">
                    <div className={`relative flex flex-row z-10`}>
                        <div
                            className={`cursor-pointer h-full py-3 px-4 flex md:flex-row flex-row-reverse items-center justify-between border border-[#d7d7d766] rounded-[4px] text-primary hover:border-white`}
                            onClick={directToVaults}
                        >
                            <p className="text-white leading-none">Earn</p>
                        </div>
                    </div>
                    {address ? (
                        <div className={`relative flex flex-row z-10`}>
                            <div
                                className={`cursor-pointer h-full py-3 px-4 md:px-6 flex md:flex-row flex-row-reverse items-center justify-between border border-[#d7d7d766] rounded-[4px] text-primary`}
                                onClick={openChainModal}
                            >
                                <img src={logo} alt={chainName} className="w-5 h-5 md:mr-3 mr-1" />
                                <div className="w-[1px] h-full bg-white md:flex hidden" />
                                <p className="ml-3 text-customLightGray md:flex hidden leading-none">{address?.substring(0, 5)}...</p>
                                <ChevronDownIcon className="w-5 h-5 mr-1 text-customLightGray" aria-hidden="true" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-52">
                            <MainActionButton label="Connect Wallet" handleClick={openConnectModal} hidden={address ? true : false} />
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full p-6 md:hidden">
                <p className="text-white">
                    VaultCraft uses novel technology and is experimental software.
                    You might encounter some bugs. If you have questions text us here in {" "}
                    <a href="https://discord.gg/n46dDQ5G" className="text-blue-500">Discord</a>.
                </p>
            </div>
        </div>
    );
}
