import { ChevronDownIcon } from "@heroicons/react/24/solid";
import PseudoRadioButton from "@/components/button/PseudoRadioButton";
import Image from "next/image";
import { useState } from "react";
import { ChainId, networkLogos } from "@/lib/utils/connectors";
import PopUpModal from "@/components/modal/PopUpModal";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'


interface NetworkFilterProps {
  supportedNetworks: ChainId[];
  selectNetwork: (chainId: ChainId) => void;
}

export default function NetworkFilter({
  supportedNetworks,
  selectNetwork,
}: NetworkFilterProps): JSX.Element {
  const [openFilter, setOpenFilter] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState(ChainId.ALL);

  const setActiveAndSelectedNetwork = (chainId: ChainId) => {
    setActiveNetwork(chainId);
    selectNetwork(chainId);
  };
  return (
    <>
      <div className="hidden md:flex flex-row items-center space-x-2">
        <Menu>
          <MenuButton>Networks</MenuButton>
          <MenuItems anchor="bottom">
            <MenuItem>
              <a className="block data-[focus]:bg-blue-100" href="/settings">
                Settings
              </a>
            </MenuItem>
            <MenuItem>
              <a className="block data-[focus]:bg-blue-100" href="/support">
                Support
              </a>
            </MenuItem>
            <MenuItem>
              <a className="block data-[focus]:bg-blue-100" href="/license">
                License
              </a>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>

      <div className="block md:hidden my-10 xs:my-0">
        <button
          onClick={(e) => {
            e.preventDefault();
            setOpenFilter(true);
          }}
          className="w-full py-3 px-5 flex flex-row items-center justify-between space-x-1 rounded-4xl border border-white"
        >
          <div className="flex items-center">
            <Image
              src={networkLogos[activeNetwork]}
              alt={"activeNetwork"}
              height="24"
              width="24"
            />
            <p className="ml-4 mt-1 text-white">
              {activeNetwork === ChainId.ALL
                ? "All Networks"
                : ChainId[activeNetwork]}
            </p>
          </div>
          <ChevronDownIcon className="w-5 h-5 text-white" aria-hidden="true" />
        </button>
      </div>
      <div className="no-select-dot absolute left-0">
        <PopUpModal
          visible={openFilter}
          onClosePopUpModal={() => setOpenFilter(false)}
        >
          <>
            <p className="text-white mb-3 text-center">Select a Network</p>
            <div className="space-y-4 w-full">
              <div className="w-full">
                <PseudoRadioButton
                  key={"all"}
                  label={
                    <div className="flex flex-row items-center w-full ml-4">
                      <Image
                        src={networkLogos[ChainId.ALL]}
                        alt={"All"}
                        height="24"
                        width="24"
                      />
                      <p className="ml-4 mb-0.5">All Networks</p>
                    </div>
                  }
                  handleClick={() => {
                    setActiveAndSelectedNetwork(ChainId.ALL);
                    setOpenFilter(false);
                  }}
                  isActive={activeNetwork == ChainId.ALL}
                />
              </div>
              {supportedNetworks.map((network) => (
                <div key={network} className="w-full">
                  <PseudoRadioButton
                    label={
                      <div className="flex flex-row items-center w-full ml-4">
                        <Image
                          src={networkLogos[network]}
                          alt={ChainId[network]}
                          height="24"
                          width="24"
                        />
                        <p className="ml-4 mb-0.5">{ChainId[network]}</p>
                      </div>
                    }
                    handleClick={() => {
                      setActiveAndSelectedNetwork(network);
                      setOpenFilter(false);
                    }}
                    isActive={activeNetwork == network}
                  />
                </div>
              ))}
            </div>
          </>
        </PopUpModal>
      </div>
    </>
  );
}
