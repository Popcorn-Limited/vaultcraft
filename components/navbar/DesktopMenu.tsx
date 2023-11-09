import { useMemo, Fragment, useState } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useNetwork, useAccount } from "wagmi";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { networkLogos } from "@/lib/utils/connectors";
import MainActionButton from "@/components/buttons/MainActionButton";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import NavbarLinks from "@/components/navbar/NavbarLinks";
import { useRouter } from "next/router";

export default function DesktopMenu(): JSX.Element {
  const { pathname } = useRouter();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const logo = useMemo(() => (address && chain?.id ? networkLogos[chain.id] : networkLogos[1]), [chain?.id, address]);
  const chainName = useMemo(() => (address && chain?.name ? chain.name : "Ethereum"), [chain?.id, address]);

  const [menuVisible, toggleMenu] = useState<boolean>(false);

  return (
    <>
      <div className="flex flex-row items-center justify-between w-full py-8 px-8 z-30">
        <div className="flex flex-row items-center">
          <div>
            <Link href={`/`} passHref>
              <img src="/images/icons/popLogo.svg" alt="Logo" className="xs:w-12 xs:h-12 w-10 h-10" />
            </Link>
          </div>
          <div className="xs:hidden smmd:block ml-8 py-2 px-4 bg-[#dfff1c26] rounded">
            <span className="text-[#DFFF1C]">
                 Beta
            </span>
          </div>
        </div>
        <div className="flex flex-container h-full flex-row w-fit-content gap-x-6">
          {address ? (
            <div className={`relative flex flex-container flex-row z-10`}>
              <div
                className={`w-fit cursor-pointer h-full xs: xs:py-2 xs:bg-white smmd:bg-transparent smmd:py-[10px] xs:px-4 smmd:px-6 flex flex-row items-center justify-between border border-customLightGray rounded-4xl text-primary`}
                onClick={openChainModal}
              >
                <img src={logo} alt={chainName} className="w-5 h-5 smmd:mr-2" />
                <div className="smmd:hidden w-2 h-2 bg-[#50C56E] ml-2 rounded-full"></div>
                <span className="xs:hidden smmd:inline">
                  |
                </span>
                <p className="ml-2 leading-none xs:hidden smmd:block">{address?.substring(0, 5)}...</p>
                <ChevronDownIcon className="w-5 h-5 ml-3 text-primary xs:hidden smmd:block" aria-hidden="true" />
              </div>
            </div>
          ) : (
            <MainActionButton label="Connect Wallet" handleClick={openConnectModal} hidden={address ? true : false} />
          )}
          <button
            className={`text-primary w-10 transform transition duration-500 relative focus:outline-none`}
            onClick={() => toggleMenu(!menuVisible)}
          >
            <span
              aria-hidden="true"
              className={`block h-0.5 w-8 bg-primary ease-in-out rounded-3xl ${menuVisible ? "rotate-45 translate-y-1" : "-translate-y-2"}`}
            ></span>
            <span
              aria-hidden="true"
              className={`block h-0.5 w-8 bg-primary ease-in-out rounded-3xl ${menuVisible ? "opacity-0" : "opacity-100"}`}
            ></span>
            <span
              aria-hidden="true"
              className={`block h-0.5 w-8 bg-primary ease-in-out rounded-3xl ${menuVisible ? "-rotate-45 -translate-y-1" : "translate-y-2"}`}
            ></span>
          </button>
        </div>
      </div>
      <Transition.Root show={menuVisible} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 overflow-hidden z-50" onClose={() => toggleMenu(false)}>
          <button
            className={`text-gray-500 absolute top-8 right-8 p-6 bg-[#353945] z-50 rounded-full flex justify-center items-center w-12 h-12 `}
            onClick={() => toggleMenu(!menuVisible)}
          >
            <div className="block w-10 bg-transparent">
              <span
                aria-hidden="true"
                className={`block h-0.5 w-8 bg-white transform transition duration-500 ease-in-out rounded-3xl ${menuVisible ? "rotate-45 translate-y-0.5" : "-translate-y-2"}`}
              ></span>
              <span
                aria-hidden="true"
                className={`block h-0.5 w-8 bg-white transform transition duration-500 ease-in-out rounded-3xl ${menuVisible ? "opacity-0" : "opacity-100"}`}
              ></span>
              <span
                aria-hidden="true"
                className={`block h-0.5 w-8 bg-white transform transition duration-500 ease-in-out rounded-3xl ${menuVisible ? "-rotate-45 -translate-y-0.5" : "translate-y-2"}`}
              ></span>
            </div>
          </button>
          <div className="absolute bg-black bg-opacity-50 top-0 h-full w-full backdrop-blur transition-opacity" />
          <Dialog.Overlay className="absolute inset-0" />
          <div className="fixed inset-x-0 top-0 bottom-0 w-[320px] flex bg-transparent">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="h-full w-full flex flex-col justify-between pt-12 px-8 shadow-xl bg-[#dfff1c] overflow-y-scroll">
                <div className="flex flex-1 flex-col w-full space-y-4">
                  <div className="mb-6">
                    <Link href={`/`} passHref>
                      <img src="/images/icons/popLogoBlack.svg" alt="Logo" className="xs:w-12 xs:h-12 smmd:w-10 smmd:h-10" />
                    </Link>
                  </div>
                  <div className="flex flex-col space-y-6 flex-1">
                    <NavbarLinks />
                  </div>
                  <div className="">
                    <p className="text-[#23262F]">
                      Popcorn is a DeFi yield-optimizing protocol with customizable asset strategies that
                      instantly zap your crypto from any chain into the highest yield-generating products across DeFi in 1 click.
                    </p>
                    <div className="flex justify-between pb-12 mt-12">
                      <SocialMediaLinks />
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
