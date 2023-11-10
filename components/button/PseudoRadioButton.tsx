interface PseudoRadioButtonProps {
  label: string | React.ReactNode;
  handleClick: Function;
  isActive: boolean;
}

export default function PseudoRadioButton({ label, handleClick, isActive }: PseudoRadioButtonProps): JSX.Element {
  return (
    <button
      className={`w-full flex justify-center items-center border rounded-3xl py-3 px-4
      ${isActive ? "text-[#DFFF1C] border-[#DFFF1C] bg-[#DFFF1C] bg-opacity-20 hover:bg-opacity-50" :
          "text-white border-customLightGray hover:bg-[#23262f]"}`
      }
      type="button"
      onClick={() => handleClick()}
    >
      {label}
    </button>
  );
};

