interface PseudoRadioButtonProps {
  label: string | React.ReactNode;
  handleClick: Function;
  isActive: boolean;
}

export default function PseudoRadioButton({
  label,
  handleClick,
  isActive,
}: PseudoRadioButtonProps): JSX.Element {
  return (
    <button
      className={`w-full transition ease-in-out duration-250 flex justify-center items-center border rounded-3xl py-3 px-7
      ${
        isActive
          ? "text-primaryYellow border-primaryYellow bg-primaryYellow bg-opacity-20 hover:bg-opacity-50"
          : "text-white bg-customNeutral300 border-customNeutral100 hover:border-white"
      }`}
      type="button"
      onClick={() => handleClick()}
    >
      {label}
    </button>
  );
}
