import { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { PowerIcon } from "@heroicons/react/24/solid";
import { useAccount, useDisconnect } from "wagmi";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { networkLogos } from "@/lib/utils/connectors";
import MainActionButton from "@/components/button/MainActionButton";
import SocialMediaLinks from "@/components/common/SocialMediaLinks";
import NavbarLinks from "@/components/navbar/NavbarLinks";
import { useAtom } from "jotai";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { useRouter } from "next/router";
import { VaultData } from "@/lib/types";
import { isAddress } from "viem";

export default function Navbar(): JSX.Element {
  const router = useRouter();
  const { query } = router;
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { address: account, chain } = useAccount();
  const [menuVisible, toggleMenu] = useState<boolean>(false);
  const [logo, setLogo] = useState<string>(networkLogos[1]);
  const [chainName, setChainName] = useState<string>("Ethereum");

  const handleWalletDisconnect = () => {
    disconnect();
  };

  useEffect(() => {
    if (account && chain?.id) {
      setLogo(networkLogos[chain.id]);
      setChainName(chain.name);
    }
  }, [chain?.id, account])

  const [vaults] = useAtom(vaultsAtom);

  const [vaultData, setVaultData] = useState<VaultData>({
    chainId: chain?.id || 1,
    asset: { address: "" },
  } as unknown as VaultData);

  useEffect(() => {
    if (
      chain &&
      Object.keys(query).length > 0 &&
      Object.keys(vaults).length > 0
    ) {
      const chainIdQuery = query?.chainId! as string;
      const chainId = Number(chainIdQuery.replace("?", "").replace("&", ""));
      const foundVault = vaults[chainId].find(
        (vault) => vault.address === query?.id
      );
      if (foundVault) setVaultData(foundVault);
    }
  }, [query, chain]);

  return (
    <>
      <div className="flex container flex-row items-center justify-between w-full py-8 px-4 md:px-0 z-10">
        <div className="flex flex-row items-center gap-6">
          <div>
            <Link
              href={
                !!query?.ref && isAddress(query.ref as string)
                  ? `/?ref=${query.ref}`
                  : `/`
              }
              passHref
            >
              <img
                src="/images/icons/popLogo.svg"
                alt="Logo"
                className="w-12 h-12 md:w-10 md:h-10 text-white"
              />
            </Link>
          </div>
        </div>
        <div className="flex flex-row items-center space-x-4">
          <div className="hidden md:flex flex-row space-x-4">
            <MigrateVCXButton />
          </div>
          {account ? (
            <div className={`relative flex flex-container flex-row z-10`}>
              <div
                className={`md:w-48 h-full py-2 px-4 md:px-6 flex flex-row items-center justify-between bg-transparent border border-customGray100 rounded-4xl cursor-pointer  text-white text-sm`}
              >
                <img
                  src={logo}
                  alt={chainName}
                  className="w-5 h-5 md:mr-2"
                  onClick={openChainModal}
                />
                <div className="md:hidden w-2 h-2 bg-green-500 ml-1 rounded-full"></div>
                <span className="hidden md:inline">|</span>
                <p className="ml-2 leading-none hidden md:block">
                  {account?.substring(0, 5)}...
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
            <div className="w-48">
              <MainActionButton
                label="Connect Wallet"
                handleClick={openConnectModal}
                hidden={!!account}
              />
            </div>
          )}
          <button
            className={`text-white w-10 h-10 p-1 transform transition duration-500 relative focus:outline-none`}
            onClick={() => toggleMenu(!menuVisible)}
          >
            <span
              aria-hidden="true"
              className={`block h-1 md:h-0.5 w-8 bg-white ease-in-out rounded-3xl ${menuVisible ? "rotate-45 translate-y-1" : "-translate-y-2"
                }`}
            ></span>
            <span
              aria-hidden="true"
              className={`block h-1 md:h-0.5 w-8 bg-white ease-in-out rounded-3xl ${menuVisible ? "opacity-0" : "opacity-100"
                }`}
            ></span>
            <span
              aria-hidden="true"
              className={`block h-1 md:h-0.5 w-8 bg-white ease-in-out rounded-3xl ${menuVisible ? "-rotate-45 -translate-y-1" : "translate-y-2"
                }`}
            ></span>
          </button>
        </div>
      </div >
      <Transition show={menuVisible} as={Fragment}>
        <div className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur transition-opacity z-50
            data-[closed]:opacity-0 
            data-[enter]:duration-300 data-[enter]:data-[closed]:ease-out
            data-[leave]:duration-200 data-[leave]:data-[closed]:ease-in
              `} />
        <Dialog as="div" className="relative z-50" open={menuVisible} onClose={() => toggleMenu(false)}>
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="fixed inset-x-0 top-0 bottom-0 w-[320px] flex">
                <DialogPanel className="h-full w-full flex flex-col justify-between pt-12 px-8 shadow-xl bg-primaryGreen overflow-y-scroll">
                  <div className="flex flex-1 flex-col w-full space-y-4">
                    <div className="mb-6">
                      <Link href={(!!query?.ref && isAddress(query.ref as string)) ? `/?ref=${query.ref}` : `/`} passHref>
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
                      <div className="md:hidden space-y-4">
                        <MigrateVCXButton />
                      </div>
                    </div>
                    <div className="pt-12 md:pt-0">
                      <p className="text-customNeutral200">
                        VaultCraft is a DeFi yield-optimizing protocol with
                        customizable asset strategies that instantly zap your
                        crypto from any chain into the highest yield-generating
                        products across DeFi in 1 click.
                      </p>
                      <div className="flex justify-between pb-12 mt-12">
                        <SocialMediaLinks
                          color="#23262F"
                          color2="#7AFB79"
                          size="24"
                        />
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </div>
            </div>
          </div>

          <button
            className="text-customGray500 fixed top-8 right-8 p-6 bg-customNeutral100 z-50 rounded-full flex justify-center items-center w-12 h-12"
            onClick={() => toggleMenu(false)}
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
        </Dialog>
      </Transition>
    </>
  );
}

function BuyVCXButton(): JSX.Element {
  return (
    <>
      <button
        className={`w-48 px-4 py-2 rounded bg-white border border-white font-semibold text-base text-black
                  transition-all ease-in-out duration-500 hover:bg-primaryGreen hover:border-primaryGreen
                  disabled:bg-customGray100 disabled:border-customGray100 disabled:text-white disabled:cursor-not-allowed
                  disabled:hover:border-customGray100 disabled:hover:bg-customGray100 disabled:hover:text-white
                  hidden md:flex flex-row items-center justify-center`}
        type="button"
        onClick={() =>
          window.open("https://swap.cow.fi/#/1/swap/WETH/VCX", "_blank")
        }
      >
        <img
          src="https://icons.llamao.fi/icons/protocols/cowswap?w=48&h=48"
          className="w-5 h-5 rounded-full border border-white"
        />
        <p className="ml-2 mt-1">Buy VCX</p>
      </button>
      <button
        className={`w-48 px-4 py-2 rounded bg-black border border-black font-semibold text-base text-primaryGreen
        transition-all ease-in-out duration-500 hover:bg-white hover:border-white hover:text-black
        disabled:bg-customGray100 disabled:border-customGray100 disabled:text-white disabled:cursor-not-allowed
        disabled:hover:border-customGray100 disabled:hover:bg-customGray100 disabled:hover:text-white
        md:hidden flex flex-row items-center justify-center`}
        type="button"
        onClick={() =>
          window.open("https://swap.cow.fi/#/1/swap/WETH/VCX", "_blank")
        }
      >
        <img
          src="https://icons.llamao.fi/icons/protocols/cowswap?w=48&h=48"
          className="w-5 h-5 rounded-full border border-customGray500"
        />
        <p className="ml-2 mb-1">Buy VCX</p>
      </button>
    </>
  );
}

function MigrateVCXButton(): JSX.Element {
  return (
    <>
      <button
        className={`w-48 px-4 py-2 rounded bg-primaryGreen border border-primaryGreen font-semibold text-base text-black
                  transition-all ease-in-out duration-500 hover:bg-white hover:border-white
                  disabled:bg-customGray100 disabled:border-customGray100 disabled:text-white disabled:cursor-not-allowed
                  disabled:hover:border-customGray100 disabled:hover:bg-customGray100 disabled:hover:text-white
                  hidden md:flex flex-row items-center justify-center`}
        type="button"
        onClick={() =>
          window.open("https://app.vaultcraft.io/staking", "_blank")
        }
      >
        <img
          src="/images/tokens/vcx.svg"
          className="w-5 h-5 rounded-full border border-black"
        />
        <p className="ml-2 mt-1">Migrate VCX</p>
      </button>
      <button
        className={`w-48 px-4 py-2 rounded bg-black border border-black font-semibold text-base text-primaryGreen
        transition-all ease-in-out duration-500 hover:bg-white hover:border-white hover:text-black
        disabled:bg-customGray100 disabled:border-customGray100 disabled:text-white disabled:cursor-not-allowed
        disabled:hover:border-customGray100 disabled:hover:bg-customGray100 disabled:hover:text-white
        md:hidden flex flex-row items-center justify-center`}
        type="button"
        onClick={() =>
          window.open("https://app.vaultcraft.io/staking", "_blank")
        }
      >
        <img
          src="/images/tokens/vcx.svg"
          className="w-5 h-5 rounded-full border border-customGray500"
        />
        <p className="ml-2 mb-1">Stake VCX</p>
      </button>
    </>
  );
}
