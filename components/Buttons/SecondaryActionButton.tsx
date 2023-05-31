import React from "react";
import { ButtonProps } from "./MainActionButton";


const SecondaryActionButton: React.FC<ButtonProps> = ({
    label,
    handleClick,
    disabled = false,
    type = "button",
    hidden = false,
}) => {
    return (
        <button
            className={`border border-white text-white hover:bg-[#D7D7D7] hover:border-[#D7D7D7] px-8 py-3 rounded-[4px] font-medium text-base transition-all ease-in-out duration-500 w-full disabled:bg-customLightGray disabled:border-customLightGray disabled:text-secondaryLight disabled:hover:border-customLightGray disabled:hover:bg-customLightGray disabled:hover:text-secondaryLight ${hidden ? "hidden" : ""}`}
            onClick={handleClick}
            type={type}
            disabled={disabled}
        >
            {label}
        </button>
    );
};

export default SecondaryActionButton;
