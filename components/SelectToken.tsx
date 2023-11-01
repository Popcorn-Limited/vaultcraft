import { useState } from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Token } from "@/lib/types";
import { ChainId } from "@/lib/utils/connectors";
import TokenIcon from "@/components/common/TokenIcon";
import SearchToken from "@/components/SearchToken";
import Modal from "@/components/modal/Modal";

export interface SelectTokenProps {
  allowSelection: boolean;
  options: Token[];
  selectedToken: Token;
  selectToken: (token: Token) => void;
  chainId: ChainId;
}

export default function SelectToken({
  allowSelection,
  options,
  selectedToken,
  selectToken,
  chainId,
}: SelectTokenProps): JSX.Element {
  const [show, setShow] = useState(false);

  return (
    <>
      {/* Desktop Token Search */}
      {/* TODO - style this */}
      <div className="hidden md:block">
        <Modal visibility={[show, setShow]}>
          <div>
            <Image src="/images/blackCircle.svg" width={88} height={88} alt="default token icon" />
            <h2>Select a token</h2>
            <div className="mt-8">
              <SearchToken
                chainId={chainId}
                options={options}
                selectToken={(token) => {
                  selectToken(token);
                  setShow(false);
                }}
                selectedToken={selectedToken}
              />
            </div>
          </div>
        </Modal>
      </div>
      <div className="relative w-auto justify-end">
        <span
          className={`flex flex-row items-center justify-end ${allowSelection ? "cursor-pointer group" : ""}`}
          onClick={() => {
            allowSelection && setShow(true);
          }}
        >
          <div className="md:mr-2 relative">
            <TokenIcon token={selectedToken} icon={selectedToken?.logoURI} imageSize="w-5 h-5" chainId={chainId} />
          </div>
          <p className="font-medium text-lg leading-none hidden md:block text-black group-hover:text-primary">
            {selectedToken?.symbol}
          </p>
          {allowSelection && (
            <ChevronDownIcon
              className={`w-6 h-6 ml-2 text-secondaryLight group-hover:text-primary 
              transform transition-all ease-in-out duration-200 ${show ? " rotate-180" : ""}`}
            />
          )}
        </span>
      </div>
      {/* Mobile Token Search */}
      {/* TODO - add this */}
      <div className="fixed md:hidden z-100 left-0">
        {/* <PopUpModal
          visible={showPopUp}
          onClosePopUpModal={() => {
            setShowPopUp(false);
          }}
        >
          <p className="text-base text-black font-normal mb-2">Select a token</p>
          <SearchToken
            chainId={chainId}
            options={options}
            selectToken={(token) => {
              selectToken(token);
              setShowSelectTokenModal(false);
            }}
            selectedToken={selectedToken}
          />
        </PopUpModal> */}
      </div>
    </>
  );
}
