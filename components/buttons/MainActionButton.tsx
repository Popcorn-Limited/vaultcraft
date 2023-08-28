import React from "react";

export interface ButtonProps {
    label: string;
    handleClick?: any;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    hidden?: boolean;
    className?: string;
}
const MainActionButton: React.FC<ButtonProps> = ({
    label,
    handleClick,
    disabled = false,
    type = "button",
    hidden = false,
    className = "",
}) => {
    return (
        <button
            className={`${className}
            w-full px-8 py-3 rounded-[4px] bg-white border border-white font-semibold text-base text-black 
            transition-all ease-in-out duration-500 hover:bg-[#DFFF1C] hover:border-[#DFFF1C] 
            disabled:bg-[#D7D7D7] disabled:border-[#D7D7D7] disabled:text-white disabled:cursor-not-allowed 
            disabled:hover:border-[#D7D7D7] disabled:hover:bg-[#D7D7D7] disabled:hover:text-white
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
