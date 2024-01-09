import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Token } from "@/lib/types";
import { ChainId } from "@/lib/utils/connectors";
import TokenIcon from "@/components/common/TokenIcon";
import SearchToken from "@/components/input/SearchToken";
import Modal from "@/components/modal/Modal";
import PopUpModal from "@/components/modal/PopUpModal";
import { Tooltip } from "react-tooltip";

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
  const selectTokenId = selectedToken?.symbol.split(' ').join('');
  return (
    <>
      {/* Desktop Token Search */}
      <div className="hidden md:block">
        <Modal
          visibility={[show, setShow]}
          classNames="hidden md:block md:w-fit md:min-w-fit"
          title={<h2 className="text-white text-2xl">Select a token</h2>}
        >
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
        </Modal>
      </div>
      <div className="relative w-auto justify-end">
        <span
          className={`flex flex-row items-center justify-end ${allowSelection ? "cursor-pointer group" : ""}`}
          onClick={() => {
            allowSelection && setShow(true);
          }}
        >
          <div className="md:mr-2 relative flex-none w-5 h-5">
            <TokenIcon token={selectedToken} icon={selectedToken?.logoURI} imageSize="w-5 h-5" chainId={chainId} />
          </div>
          <p id={selectTokenId} className="font-medium text-lg leading-none hidden md:block text-white group-hover:text-primary truncate cursor-pointer">
            {selectedToken?.symbol}
          </p>
          <div className='hidden md:block'>
            <Tooltip
              anchorSelect={`#${selectTokenId}`}
              place="bottom"
              style={{ backgroundColor: "#353945" }}
            >
              {selectedToken?.symbol}
            </Tooltip>
          </div>
          <div className='md:hidden'>
            <Tooltip
              anchorSelect={`#${selectedToken?.symbol}`}
              openOnClick
              place="bottom"
              style={{ backgroundColor: "#353945" }}
            >
              {selectedToken?.symbol}
            </Tooltip>
          </div>
          {allowSelection && (
            <ChevronDownIcon
              className={`w-6 h-6 ml-2 text-secondaryLight group-hover:text-primary 
              transform transition-all ease-in-out duration-200 ${show ? " rotate-180" : ""}`}
            />
          )}
        </span>
      </div>
      {/* Mobile Token Search */}
      <div className="fixed z-100 left-0">
        <PopUpModal
          visible={show}
          onClosePopUpModal={() => setShow(false)}
          classNames="w-fit max-w-fit min-w-fit"
        >
          <p className="text-base text-white font-normal mb-2">Select a token</p>
          <SearchToken
            chainId={chainId}
            options={options}
            selectToken={(token) => {
              selectToken(token);
              setShow(false);
            }}
            selectedToken={selectedToken}
          />
        </PopUpModal>
      </div>
    </>
  );
}
