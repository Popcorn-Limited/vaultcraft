import React from "react";

export interface ButtonProps {
  label: string;
  handleClick?: (event: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
}

export default function MainActionButton({
  label,
  handleClick,
  className,
  disabled = false,
  hidden = false,
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`w-full px-8 py-2.5 rounded bg-white border border-white font-semibold text-base text-black 
                  transition-all ease-in-out duration-500 hover:bg-primaryYellow hover:border-primaryYellow 
                  disabled:bg-customGray100 disabled:border-customGray100 disabled:text-white disabled:cursor-not-allowed 
                  disabled:hover:border-customGray100 disabled:hover:bg-customGray100 disabled:hover:text-white
                  ${hidden ? "hidden" : ""} ${className}`}
      onClick={handleClick}
      type="button"
      disabled={disabled}
    >
      {label}
    </button>
  );
}
