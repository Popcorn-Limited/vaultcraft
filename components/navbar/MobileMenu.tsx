import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useNetwork } from "wagmi";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import { ChainId, networkLogos, networkMap } from "@/lib/utils/connectors";
import NavbarLinks from "@/components/navbar/NavbarLinks";
import PopUpModal from "@/components/modal/PopUpModal";
import MainActionButton from "@/components/button/MainActionButton";
import TertiaryActionButton from "@/components/button/TertiaryActionButton";

const networkData = [
  {
    id: JSON.stringify(ChainId.Ethereum),
    value: networkMap[ChainId.Ethereum],
  },
  {
    id: JSON.stringify(ChainId.Arbitrum),
    value: networkMap[ChainId.Arbitrum],
  },
  {
    id: JSON.stringify(ChainId.BNB),
    value: networkMap[ChainId.BNB],
  },
  {
    id: JSON.stringify(ChainId.Polygon),
    value: networkMap[ChainId.Polygon],
  },
];

export default function MobileMenu(): JSX.Element {
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { openChainModal } = useChainModal();
  const { chain } = useNetwork();

  const [menuVisible, toggleMenu] = useState<boolean>(false);
  const [productsMenuVisible, toggleProductsMenu] = useState<boolean>(false);
  const [availableNetworks, setAvailableNetworks] = useState(networkData);
  const router = useRouter();
  const [showPopUp, setShowPopUp] = useState<boolean>(false);

  const logo = useMemo(() => (address && chain?.id ? networkLogos[chain.id] : networkLogos[1]), [chain?.id, address]);
  const chainName = useMemo(() => (address && chain?.name ? chain.name : "Ethereum"), [chain?.id, address]);

  useEffect(() => {
    if (availableNetworks.length <= networkData.length) {
      setAvailableNetworks([
        ...availableNetworks,
        {
          id: JSON.stringify(ChainId.Goerli),
          value: networkMap[ChainId.Goerli],
        },
        {
          id: JSON.stringify(ChainId.Localhost),
          value: networkMap[ChainId.Localhost],
        },
      ]);
    }
  }, []);

  const closePopUp = () => {
    setShowPopUp(false);
  };

  return (
    <>
      <div className={`flex flex-row justify-between items-center py-6 font-khTeka ${router.pathname === "/" ? "bg-[#FAF9F4]" : ""}`}>
        <div>
          <Link href={`/`} passHref>
            <img src="/images/icons/popLogo.svg" alt="Logo" className="w-10 h-10" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className={`relative w-full ${!menuVisible ? "" : "hidden"}`}>
            <div
              className={`w-full px-4 py-3 flex flex-row items-center justify-center border border-light rounded-3xl cursor-pointer relative gap-2 
              ${router.pathname === "/" ? "bg-[#FAF9F4]" : ""}`}
              onClick={() => setShowPopUp(true)}
            >
              <img src={logo} alt={""} className="w-3 h-3 object-contain" />
              <span
                className={`${address ? "border-green-400 bg-green-400" : "border-gray-300"
                  } block h-2 w-2 rounded-full border`}
              ></span>
            </div>
          </div>
          <button
            className="text-gray-500 w-10 relative focus:outline-none"
            onClick={() => toggleMenu(!menuVisible)}
          >
            <div className="block w-10">
              <span
                aria-hidden="true"
                className={`block h-1 w-10 bg-black transform transition duration-500 ease-in-out rounded-3xl ${menuVisible ? "rotate-45 translate-y-1" : "-translate-y-2.5"
                  }`}
              />
              <span
                aria-hidden="true"
                className={`block h-1 w-10 bg-black transform transition duration-500 ease-in-out rounded-3xl ${menuVisible ? "opacity-0" : "opacity-100"
                  }`}
              />
              <span
                aria-hidden="true"
                className={`block h-1 w-10 bg-black transform transition duration-500 ease-in-out rounded-3xl ${menuVisible ? "-rotate-45 -translate-y-1" : "translate-y-2.5"
                  }`}
              />
            </div>
          </button>
        </div>
      </div>
      <Transition.Root show={menuVisible} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 overflow-hidden z-50" onClose={() => toggleMenu(false)}>
          <div className="absolute inset-0 overflow-hidden">
            <Dialog.Overlay className="absolute inset-0" />
            <div className="fixed inset-x-0 top-20 bottom-0 max-w-full flex bg-white">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="w-screen">
                  <div className="h-full w-full flex flex-col justify-between pt-18 px-6 shadow-xl bg-white overflow-y-scroll">
                    <div className="flex flex-col w-full space-y-6">
                      <NavbarLinks />
                    </div>
                    <div>
                      <div className="grid grid-cols-12 mt-12">
                        <div className="col-span-6">
                          <p className="text-gray-900 font-medium leading-6 tracking-1">Links</p>
                          <div className="flex flex-col">
                            <Link href="/" className=" text-primary leading-6 mt-4">
                              Popcorn
                            </Link>
                          </div>
                        </div>

                        <div className="col-span-6">
                          <p className="text-gray-900 font-medium leading-6 tracking-1">Bug Bounty</p>
                          <div className="flex flex-col">
                            <Link
                              href="https://immunefi.com/bounty/popcornnetwork"
                              className=" text-primary leading-6 mt-4"
                            >
                              Immunefi
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between pb-12 mt-11">
                        <SocialMediaLinks />
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <PopUpModal visible={showPopUp} onClosePopUpModal={closePopUp}>
        <div>
          <p className="text-black mb-3">Connect to Wallet</p>
          <MainActionButton label="Connect Wallet" handleClick={openConnectModal} hidden={!!address} />
          <TertiaryActionButton label="Disconnect" handleClick={() => disconnect()} hidden={!address} />
          <hr className="my-6" />
          <p className="text-black mb-3">Select Network</p>
          <div
            className={`h-12 px-6 flex flex-row items-center justify-center border border-customLightGray rounded-4xl text-primary cursor-pointer`}
            onClick={openChainModal}
          >
            <img src={logo} alt={chainName} className="w-4.5 h-4 mr-4" />
            <p className="leading-none mt-0.5">{chainName}</p>
          </div>
        </div>
      </PopUpModal>
    </>
  );
};
