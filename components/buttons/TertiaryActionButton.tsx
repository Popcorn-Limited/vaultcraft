import { ButtonProps } from "@/components/button/MainActionButton";

export default function TertiaryActionButton({ label, handleClick, disabled = false, hidden = false }: ButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={`whitespace-nowrap px-8 py-3 font-medium text-base transition-all ease-in-out duration-500 w-full flex flex-row items-center justify-center bg-white border border-primary text-primary rounded-4xl hover:bg-primary hover:text-white disabled:bg-white disabled:border-secondaryLight disabled:text-secondaryLight disabled:hover:border-secondaryLight disabled:hover:text-secondaryLight disabled:hover:bg-white ${hidden ? "hidden" : ""
        }`}
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

