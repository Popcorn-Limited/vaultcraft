interface PseudoRadioButtonProps {
  label: string | React.ReactNode;
  handleClick: Function;
  isActive: boolean;
  extraClasses?: string;
}

export default function PseudoRadioButton({ label, handleClick, isActive, extraClasses, }: PseudoRadioButtonProps): JSX.Element {
  return (
    <button
      className={` h-12 w-18 text-primary flex justify-center items-center border rounded-3xl
      ${isActive ? "border-[#DFFF1C] bg-[#DFFF1C] bg-opacity-20" : "border-customLightGray"}`}
      type="button"
      onClick={() => handleClick()}
    >
      {label}
    </button>
  );
};

