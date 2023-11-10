import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ChainId } from "@/lib/utils/connectors";
import { Token } from "@/lib/types";
import TokenIcon from "@/components/common/TokenIcon";
import { getAssetsByChain } from "@/lib/constants";

interface SearchTokenProps {
  selectToken: (token: Token) => void;
  selectedToken: Token;
  options: Token[];
  chainId: ChainId;
}

export default function SearchToken({ options, selectToken, selectedToken, chainId }: SearchTokenProps): JSX.Element {
  const quickOptionsTokens = getAssetsByChain(chainId);

  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<Token[]>(options);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.trim().length > 0) {
      setFilteredOptions(options.filter((option) => option.name.toLowerCase().includes(value.toLowerCase())));
    } else {
      setFilteredOptions(options);
    }
  };

  return (
    <div className="w-full flex flex-wrap">
      {/* <div className="relative mb-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-6 w-6 md:h-8 md:w-8 text-white" aria-hidden="true" />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="block w-full h-14 md:h-14 pb-0 border-white pl-14 focus:border-white focus:ring-white rounded-5xl text-base md:text-xl placeholder:text-base md:placeholder:text-xl pt-0 bg-[#141416]"
          placeholder="Search"
        />
      </div> */}
      {options
        .filter((option) => quickOptionsTokens.find((token) => token.address == option.address))
        .map((quickOption) => (
          <div className="w-1/2 mb-4 pr-4" key={quickOption?.symbol}>
            <button
              className="w-full flex items-center rounded-lg border border-customLightGray hover:border-white hover:bg-gray-500 
              font-medium text-white py-2 px-3 md:py-2.5 md:px-4 text-base md:text-lg"
              onClick={() => {
                selectToken(quickOption);
              }}
            >
              <span className="relative mr-2">
                <TokenIcon token={quickOption} imageSize="w-5 h-5" chainId={chainId} />
              </span>
              <span>{quickOption.name}</span>
            </button>
          </div>
        ))}
      {/* <div className="mt-4">
        <ul className="scrollable__select py-6 overflow-y-auto shadow-scrollableSelect rounded-lg p-6 border border-customPaleGray">
          {filteredOptions.map((option) => (
            <li
              className="my-1 bg-transparent text-base md:text-lg hover:bg-customPaleGray hover:bg-opacity-40 rounded-lg"
              key={option.symbol}
              onClick={() => {
                selectToken(option);
              }}
            >
              <span
                className={`flex items-center py-3 px-3 ${selectedToken.address === option.address
                  ? "text-[#DFFF1C] font-semibold"
                  : "text-primary font-normal  cursor-pointer"
                  }`}
              >
                <span className="w-5 h-5 inline-flex mr-3 flex-shrink-0 cursor-pointer">
                  <img src={option.logoURI} alt={option.symbol} className="h-full w-full object-contain" />
                </span>
                <span className="cursor-pointer">{option.symbol}</span>
              </span>
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
};
