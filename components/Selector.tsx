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

export function Option({ value, children, selected }: { value: any; children: any, selected: boolean }) {
  return (
    <Listbox.Option value={value} as={Fragment}>
      {({ active }) => {
        return (
          <button
            className={`p-2 w-full flex gap-2 flex-row h-14 relative border border-transparent rounded-lg whitespace-nowrap text-left ${selected ? '' : 'hover:bg-[gray]'} ${selected ? "bg-[white]" : ""} `}
          >
            <img
              alt=""
              className="object-contain relative h-full w-fit z-10"
              src={value.logoURI}
            />
            <div className="flex flex-col self-center">
              <p className={`${selected ? "text-[black]" : "text-[white]"}`}>{value.symbol}</p>
              <p className={`text-[#ffffff99] ${selected ? "text-[black]" : ""}`}>{value.name}</p>
            </div>
          </button>
        );
      }}
    </Listbox.Option>
  );
}

export default Selector;
