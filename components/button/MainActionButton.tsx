import React from "react";

export interface ButtonProps {
  label: string;
  handleClick?: (event: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  hidden?: boolean;
  className?: string
}

export default function MainActionButton({ label, handleClick, className, disabled = false, hidden = false }: ButtonProps): JSX.Element {
  return (
    <button
      className={`w-full px-8 py-3 rounded-[4px] bg-white border border-white font-semibold text-base text-black 
                  transition-all ease-in-out duration-500 hover:bg-[#DFFF1C] hover:border-[#DFFF1C] 
                  disabled:bg-[#D7D7D7] disabled:border-[#D7D7D7] disabled:text-white disabled:cursor-not-allowed 
                  disabled:hover:border-[#D7D7D7] disabled:hover:bg-[#D7D7D7] disabled:hover:text-white
                  ${hidden ? "hidden" : ""} ${className}`}
      onClick={handleClick}
      type="button"
      disabled={disabled}
    >
      {label}
    </button>
  );
};
