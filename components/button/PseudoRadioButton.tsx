interface PseudoRadioButtonProps {
  label: string | React.ReactNode;
  handleClick: Function;
  isActive: boolean;
}

export default function PseudoRadioButton({ label, handleClick, isActive }: PseudoRadioButtonProps): JSX.Element {
  return (
    <button
      className={`w-full transition ease-in-out duration-250 flex justify-center items-center border rounded-3xl py-3 px-7
      ${isActive ? "text-[#DFFF1C] border-[#DFFF1C] bg-[#DFFF1C] bg-opacity-20 hover:bg-opacity-50" :
          "text-white bg-[#191A1D] border-[#656667] hover:border-primary"}`
      }
      type="button"
      onClick={() => handleClick()}
    >
      {label}
    </button>
  );
};

