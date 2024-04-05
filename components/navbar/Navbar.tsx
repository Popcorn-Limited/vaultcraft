import { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { PowerIcon } from "@heroicons/react/24/solid";
import { useNetwork, useAccount, useDisconnect } from "wagmi";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { networkLogos } from "@/lib/utils/connectors";
import MainActionButton from "@/components/button/MainActionButton";
import SocialMediaLinks from "@/components/common/SocialMediaLinks";
import NavbarLinks from "@/components/navbar/NavbarLinks";
import { aaveAccountDataAtom } from "@/lib/atoms/lending";
import { useAtom } from "jotai";
import { formatToFixedDecimals } from "@/lib/utils/formatBigNumber";
import ManageLoanInterface, { getHealthFactorColor } from "@/components/lending/ManageLoanInterface";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { useRouter } from "next/router";
import ResponsiveTooltip from "@/components/common/Tooltip";
import { VaultData } from "@/lib/types";

export default function Navbar(): JSX.Element {
  const router = useRouter();
  const { query } = router;
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [menuVisible, toggleMenu] = useState<boolean>(false);
  const [logo, setLogo] = useState<string>(networkLogos[1]);
  const [chainName, setChainName] = useState<string>("Ethereum");

  const handleWalletDisconnect = () => {
    disconnect();
  };

  useEffect(() => {
    if (address && chain?.id) {
      setLogo(networkLogos[chain.id]);
      setChainName(chain.name);
    }
  }, [chain?.id, address])

  const [userAccountData] = useAtom(aaveAccountDataAtom)
  const [vaults] = useAtom(vaultsAtom)
  const [showLendModal, setShowLendModal] = useState(false)

  return (
    <>
      {(chain && Object.keys(vaults).length > 0) &&
        <ManageLoanInterface
          visibilityState={[showLendModal, setShowLendModal]}
          vaultData={query?.id && query?.chainId ?
            (vaults[Number(query?.chainId)].find(vault => vault.address === query?.id)
              || ({ chainId: chain.id || 1, asset: { address: "" } } as unknown as VaultData))
            : ({ chainId: chain.id || 1, asset: { address: "" } } as unknown as VaultData)
          }
        />
      }
      <div className="flex flex-row items-center justify-between w-full py-8 px-4 md:px-8 z-10">
        <div className="flex flex-row items-center">
          <div>
            <Link href={`/`} passHref>
              <img
                src="/images/icons/popLogo.svg"
                alt="Logo"
                className="w-12 h-12 md:w-10 md:h-10 text-white"
              />
            </Link>
          </div>
        </div>
        <div className="flex flex-container h-full flex-row w-fit-content items-center gap-x-6">
          {(chain && userAccountData[chain?.id]?.healthFactor > 0) &&
            <div
              className={`w-fit cursor-pointer h-full py-2 bg-customNeutral300 md:bg-transparent md:py-2 px-4 md:px-6 flex flex-row items-center justify-between border border-customGray100 rounded-4xl text-white`}
              onClick={() => setShowLendModal(true)}
              id="global-health-factor"
            >
              <p className="mr-2 leading-none hidden md:block">Health Factor</p>
              <p className={`md:ml-2 ${getHealthFactorColor("text", userAccountData[chain.id].healthFactor)}`}>
                {formatToFixedDecimals(userAccountData[chain.id].healthFactor || 0, 2)}
              </p>
              <ResponsiveTooltip
                id="global-health-factor"
                content={<p className="max-w-52">Health Factor of your Aave Account. (Click to manage)</p>}
              />
            </div>
          }
          {address ? (
            <div className={`relative flex flex-container flex-row z-10`}>
              <div
                className={`w-fit cursor-pointer h-full py-2 bg-customNeutral300 md:bg-transparent md:py-2 px-4 md:px-6 flex flex-row items-center justify-between border border-customGray100 rounded-4xl text-white`}
              >
                <img
                  src={logo}
                  alt={chainName}
                  className="w-5 h-5 md:mr-2"
                  onClick={openChainModal}
                />
                <div className="hidden w-2 h-2 bg-green-500 ml-2 rounded-full"></div>
                <span className="hidden md:inline">|</span>
                <p className="ml-2 leading-none hidden md:block">
                  {address?.substring(0, 5)}...
                </p>
                <span className="hidden md:inline">|</span>
                <PowerIcon
                  className="w-5 h-5 ml-3 text-white hidden md:block"
                  aria-hidden="true"
                  onClick={handleWalletDisconnect}
                />
              </div>
            </div>
          ) : (
            <MainActionButton
              label="Connect Wallet"
              handleClick={openConnectModal}
              hidden={address ? true : false}
            />
          )}
          <button
            className={`text-white w-10 transform transition duration-500 relative focus:outline-none`}
            onClick={() => toggleMenu(!menuVisible)}
          >
            <span
              aria-hidden="true"
              className={`block h-0.5 w-8 bg-white ease-in-out rounded-3xl ${menuVisible ? "rotate-45 translate-y-1" : "-translate-y-2"
                }`}
            ></span>
            <span
              aria-hidden="true"
              className={`block h-0.5 w-8 bg-white ease-in-out rounded-3xl ${menuVisible ? "opacity-0" : "opacity-100"
                }`}
            ></span>
            <span
              aria-hidden="true"
              className={`block h-0.5 w-8 bg-white ease-in-out rounded-3xl ${menuVisible ? "-rotate-45 -translate-y-1" : "translate-y-2"
                }`}
            ></span>
          </button>
        </div>
      </div >
      <Transition.Root show={menuVisible} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 overflow-hidden z-50"
          onClose={() => toggleMenu(false)}
        >
          <button
            className={`text-customGray500 absolute top-8 right-8 p-6 bg-customNeutral100 z-50 rounded-full flex justify-center items-center w-12 h-12`}
            onClick={() => toggleMenu(!menuVisible)}
          >
            <div className="block w-10 bg-transparent">
              <span
                aria-hidden="true"
                className={`block h-0.5 w-8 bg-white transform transition duration-500 ease-in-out rounded-3xl ${menuVisible ? "rotate-45 translate-y-0.5" : "-translate-y-2"
                  }`}
              ></span>
              <span
                aria-hidden="true"
                className={`block h-0.5 w-8 bg-white transform transition duration-500 ease-in-out rounded-3xl ${menuVisible ? "opacity-0" : "opacity-100"
                  }`}
              ></span>
              <span
                aria-hidden="true"
                className={`block h-0.5 w-8 bg-white transform transition duration-500 ease-in-out rounded-3xl ${menuVisible ? "-rotate-45 -translate-y-0.5" : "translate-y-2"
                  }`}
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
              <div className="h-full w-full flex flex-col justify-between pt-12 px-8 shadow-xl bg-primaryYellow overflow-y-scroll">
                <div className="flex flex-1 flex-col w-full space-y-4">
                  <div className="mb-6">
                    <Link href={`/`} passHref>
                      <img
                        src="/images/icons/popLogoBlack.svg"
                        alt="Logo"
                        className="w-12 h-12 md:w-10 md:h-10 text-white"
                      />
                    </Link>
                  </div>
                  <div
                    className="flex flex-col space-y-6 flex-1"
                    onClick={() => toggleMenu(false)}
                  >
                    <NavbarLinks />
                  </div>
                  <div className="">
                    <p className="text-customNeutral200">
                      VaultCraft is a DeFi yield-optimizing protocol with
                      customizable asset strategies that instantly zap your
                      crypto from any chain into the highest yield-generating
                      products across DeFi in 1 click.
                    </p>
                    <div className="flex justify-between pb-12 mt-12">
                      <SocialMediaLinks
                        color="#23262F"
                        color2="#dfff1c"
                        size="24"
                      />
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
