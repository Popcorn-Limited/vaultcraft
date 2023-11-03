import React from "react";
import { ButtonProps } from "@/components/buttons/MainActionButton";

export default function SecondaryActionButton({ label, handleClick, hidden, disabled = false }: ButtonProps): JSX.Element {
  return (
    <button
      className={`${hidden ? "hidden" : ""
        } w-full py-2 px-8 border border-[#D7D7D7]/40 rounded justify-center w-full flex items-center text-primary hover:text-primaryDark transition-all ease-in-out font-medium leading-4 md:leading-7 cursor-pointer relative min-h-full`}
      onClick={handleClick}
      disabled={disabled}
    >
      <span className="font-bold">{label}</span>
    </button>
  );
};
