interface PseudoRadioButtonProps {
  label: string | React.ReactNode;
  handleClick: Function;
  isActive: boolean;
  activeClass?: string;
  extraClasses?: string;
}

export default function PseudoRadioButton({ label, handleClick, isActive, activeClass, extraClasses, }: PseudoRadioButtonProps): JSX.Element {
  return (
    <button
      className={`leading-8 ${extraClasses ? extraClasses : "py-2 px-3  h-12 border w-full rounded-lg text-lg"} ${isActive ? `${activeClass ? activeClass : "border-1 border-tokenTextGray"}` : "border-customLightGray"
        }`}
      type="button"
      onClick={() => handleClick()}
    >
      {label}
    </button>
  );
};

