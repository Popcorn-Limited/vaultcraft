import React from "react";

export interface ButtonProps {
    label: string;
    handleClick?: any;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    hidden?: boolean;
}
const MainActionButton: React.FC<ButtonProps> = ({
    label,
    handleClick,
    disabled = false,
    type = "button",
    hidden = false,
}) => {
    return (
        <button
            className={`w-full px-8 py-3 rounded-[4px] bg-white border border-[#ffffff80] font-medium text-base text-black 
            transition-all ease-in-out duration-500 hover:bg-[#D7D7D7] hover:border-[#D7D7D7] hover:text-white 
            disabled:bg-customLightGray disabled:border-customLightGray disabled:text-secondaryLight disabled:cursor-not-allowed 
            disabled:hover:border-customLightGray disabled:hover:bg-customLightGray disabled:hover:text-secondaryLight 
            ${hidden ? "hidden" : ""}`}
            onClick={handleClick}
            type={type}
            disabled={disabled}
        >
            {label}
        </button>
    );
};

export default MainActionButton;
