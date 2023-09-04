import React from "react";
import { ButtonProps } from "./MainActionButton";


const SecondaryActionButton: React.FC<ButtonProps> = ({
    label,
    handleClick,
    disabled = false,
    type = "button",
    hidden = false,
    className = "",
}) => {
    return (
        <button
            className={`${className} bg-black border border-black text-[#DFFF1C] hover:bg-white hover:border-white hover:text-black 
            px-8 py-3 rounded-[4px] font-semibold text-base transition-all ease-in-out duration-500 w-full
          disabled:bg-customLightGray disabled:border-customLightGray disabled:text-secondaryLight 
          disabled:hover:border-customLightGray disabled:hover:bg-customLightGray disabled:hover:text-secondaryLight ${hidden ? "hidden" : ""}`}
            onClick={handleClick}
            type={type}
            disabled={disabled}
        >
            {label}
        </button>
    );
};

export default SecondaryActionButton;
