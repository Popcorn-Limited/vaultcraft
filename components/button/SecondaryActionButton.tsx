import React from "react";
import { ButtonProps } from "@/components/button/MainActionButton";

export default function SecondaryActionButton({
  label,
  handleClick,
  hidden,
  disabled = false,
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`w-full px-2 py-3 rounded bg-black border border-customNeutral100 font-semibold text-base text-primaryYellow 
      transition-all ease-in-out duration-500 hover:bg-white hover:border-white hover:text-black 
      disabled:bg-customGray100 disabled:border-customGray100 disabled:text-white disabled:cursor-not-allowed 
      disabled:hover:border-customGray100 disabled:hover:bg-customGray100 disabled:hover:text-white
      ${hidden ? "hidden" : ""}`}
      onClick={handleClick}
      disabled={disabled}
    >
      <span className="font-bold">{label}</span>
    </button>
  );
}
