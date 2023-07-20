import { Fragment } from "react";
import { Listbox } from "@headlessui/react";
import { ChevronLeftIcon, XMarkIcon } from "@heroicons/react/24/solid";

function Selector({
  selected,
  onSelect,
  title,
  description,
  children,
  optionalChildren,
}: {
  selected?: any;
  onSelect: (value: any) => void;
  title: string;
  description: string;
  children: any;
  optionalChildren?: any;
}) {
  return (
    <Listbox
      className="self-start w-full border-none"
      as="div"
      value={selected}
      onChange={onSelect}
    >
      {({ open }) => (
        <>
          <Listbox.Button className="border border-[#353945] rounded-lg flex gap-2 w-full px-2">
            <div className="h-12 flex flex-row items-center w-full gap-x-2">
              {selected?.logoURI && (
                <div className="w-9 h-8">
                  <img
                    className="object-contain w-8 h-8 rounded-full"
                    alt="selected-asset"
                    src={selected?.logoURI}
                  />
                </div>
              )}
              <span className="text-[white] w-full flex self-center flex-row justify-start">{selected?.name}</span>
              <span className="self-center text-[white] mr-2">{`>`}</span>
            </div>
          </Listbox.Button>
          {open && (
            <Listbox.Options className="z-[1] absolute flex flex-col min-w-[12rem] rounded-[20px] top-0 left-0 p-2 bg-black md:max-h-[80vh] w-full h-full overflow-auto">
              <div className="w-full h-full bg-black flex flex-col items-start gap-y-1 px-8 py-9">
                <div className="flex flex-row items-center mb-9 justify-between w-full">
                  <Listbox.Option value={selected} as={Fragment}>
                    <ChevronLeftIcon className="text-white w-10 h-10 -ml-3 cursor-pointer md:hidden" />
                  </Listbox.Option>
                  <p className="text-[white] text-2xl">
                    {title}
                  </p>
                  <Listbox.Option value={selected} as={Fragment}>
                    <XMarkIcon className="md:text-white w-10 h-10 cursor-pointer" />
                  </Listbox.Option>
                </div>
                <p className="text-white">{description}</p>
                <div className="mt-2 mb-6 w-full">
                  {optionalChildren}
                </div>
                <div className="flex flex-col overflow-y-scroll scrollbar-hide w-full">
                  {children}
                </div>
              </div>
            </Listbox.Options>
          )}
        </>
      )}
    </Listbox >
  );
}

export function Option({ value, children, selected, disabled, apy }: { value: any; children: any, selected: boolean, disabled?: boolean, apy?: number }) {
  return (
    <Listbox.Option value={value} as={Fragment} disabled={disabled}>
      {({ active }) => {
        return (
          <button
            className={`flex flex-row text-left h-14 p-2 rounded-lg ${disabled ? "hover:bg-red-600 cursor-not-allowed" : "hover:bg-[gray]"} 
            ${selected ? 'bg-[white]' : ''}`}
            disabled={disabled}
          >
            {value.logoURI ?
              <img
                alt=""
                className="object-contain relative h-10 w-10 mr-4 rounded-full"
                src={value.logoURI}
              /> :
              <div className="h-10 w-10 mr-4 rounded-full bg-black"></div>
            }
            <div className="flex flex-col self-center">
              <p className={`${selected ? "text-[black]" : "text-[white]"}`}>{value.symbol}</p>
              <span className="flex flex-row">
                <p className={`${selected ? "text-[black]" : "text-[#ffffff99]"}`}>{value.name}</p>
                {disabled && <p className={`ml-1 ${selected ? "text-[black]" : "text-[#ffffff99]"}`}>- Asset not supported</p>}
              </span>
            </div>
            {apy !== undefined && <p className={`ml-auto self-center ${selected ? "text-[black]" : "text-[white]"}`}>~{apy === Infinity ? "?" : apy.toFixed(2)}%</p>}
          </button>
        );
      }}
    </Listbox.Option>
  );
}

export default Selector;
