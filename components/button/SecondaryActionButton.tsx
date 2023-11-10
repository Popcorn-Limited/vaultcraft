import React from "react";
import { ButtonProps } from "@/components/button/MainActionButton";

export default function SecondaryActionButton({ label, handleClick, hidden, disabled = false }: ButtonProps): JSX.Element {
  return (
    <button
      className={`w-full px-8 py-3 rounded-[4px] bg-black border border-black font-semibold text-base text-[#DFFF1C] 
      transition-all ease-in-out duration-500 hover:bg-white hover:border-white hover:text-black 
      disabled:bg-[#D7D7D7] disabled:border-[#D7D7D7] disabled:text-white disabled:cursor-not-allowed 
      disabled:hover:border-[#D7D7D7] disabled:hover:bg-[#D7D7D7] disabled:hover:text-white
      ${hidden ? "hidden" : ""}`}
      onClick={handleClick}
      disabled={disabled}
    >
      <span className="font-bold">{label}</span>
    </button>
  );
};
