import { ButtonProps } from "@/components/button/MainActionButton";

export default function TertiaryActionButton({ label, handleClick, disabled = false, hidden = false }: ButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={`whitespace-nowrap px-8 py-3 font-medium text-base transition-all ease-in-out duration-500 w-full flex flex-row items-center justify-center bg-white border border-primary text-primary rounded-4xl hover:bg-primary hover:text-white disabled:bg-[#D7D7D7] disabled:border-[#D7D7D7] disabled:text-white disabled:cursor-not-allowed 
      disabled:hover:border-[#D7D7D7] disabled:hover:bg-[#D7D7D7] disabled:hover:text-white ${hidden ? "hidden" : ""
        }`}
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

