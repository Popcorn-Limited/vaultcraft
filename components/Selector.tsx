import { Fragment } from "react";
import { Listbox } from "@headlessui/react";
import Image from "next/image";

function Selector({
  selected,
  onSelect,
  children,
  actionContent,
}: {
  selected?: any;
  onSelect: (value: any) => void;
  children: any;
  actionContent: (selected: any) => JSX.Element;
}) {
  return (
    <Listbox
      className="self-start w-full border-none"
      as="div"
      value={selected}
      onChange={onSelect}
    >
      <Listbox.Button className="border-1 border border-[#353945] rounded-lg flex gap-2 w-full px-2">
        {actionContent(selected)}
      </Listbox.Button>
      <Listbox.Options className="z-[1] absolute flex flex-col min-w-[12rem] rounded-lg top-0 left-0 p-2 bg-white md:max-h-[80vh] w-full h-full overflow-auto">
        {children}
      </Listbox.Options>
    </Listbox >
  );
}

export function Option({ value, children, selected, disabled }: { value: any; children: any, selected: boolean, disabled?: boolean }) {
  return (
    <Listbox.Option value={value} as={Fragment} disabled={disabled}>
      {({ active }) => {
        return (
          <button
            className={`p-2 w-full flex gap-2 flex-row h-14 relative border border-transparent rounded-lg whitespace-nowrap text-left ${disabled ? "hover:bg-red-600 cursor-not-allowed" : "hover:bg-[gray]"} 
            ${selected ? 'bg-[white]' : ''}`}
            disabled={disabled}
          >
            <img
              alt=""
              className="object-contain relative h-full w-fit z-10"
              src={value.logoURI}
            />
            <div className="flex flex-col self-center">
              <p className={`${selected ? "text-[black]" : "text-[white]"}`}>{value.symbol}</p>
              <span className="flex flex-row">
                <p className={`${selected ? "text-[black]" : "text-[#ffffff99]"}`}>{value.name}</p>
                {disabled && <p className={`ml-1 ${selected ? "text-[black]" : "text-[#ffffff99]"}`}>- Asset not supported</p>}
              </span>
            </div>
          </button>
        );
      }}
    </Listbox.Option>
  );
}

export default Selector;
