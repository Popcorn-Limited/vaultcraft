import React from "react";

export interface ButtonProps {
  label: string;
  handleClick?: (event: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  hidden?: boolean;
}

export default function MainActionButton({ label, handleClick, disabled = false, hidden = false }: ButtonProps): JSX.Element {
  return (
    <button
      className={`bg-warmGray border-ctaYellow text-black hover:bg-primary hover:border-primary hover:text-white active:bg-white active:border-primary active:text-primary rounded-4xl px-8 py-3 font-medium text-base transition-all ease-in-out duration-500 w-full disabled:bg-customLightGray disabled:border-customLightGray disabled:text-secondaryLight disabled:hover:border-customLightGray disabled:hover:bg-customLightGray disabled:hover:text-secondaryLight ${hidden ? "hidden" : ""
        }`}
      onClick={handleClick}
      type="button"
      disabled={disabled}
    >
      {label}
    </button>
  );
};