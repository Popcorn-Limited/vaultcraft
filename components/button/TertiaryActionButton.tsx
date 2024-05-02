import { ButtonProps } from "@/components/button/MainActionButton";
import RightArrowIcon from "@/components/svg/RightArrowIcon";
import { useState } from "react";

export default function TertiaryActionButton({
  label,
  handleClick,
  disabled = false,
  hidden = false,
}: ButtonProps): JSX.Element {
  const [arrowColor, setArrowColor] = useState("FFFFFF");
  const [arrowClass, setArrowClass] = useState("transform translate-x-0");

  const animateArrow = () => {
    setArrowColor("6b7280");
    setArrowClass("transform -translate-x-1/2");
    setTimeout(() => {
      setArrowColor("FFFFFF");
      setArrowClass("transform translate-x-0");
    }, 500);
  };

  return (
    <button
      className={`${
        hidden ? "hidden" : ""
      } w-full flex justify-between items-center text-customGray500 hover:text-white transition-all ease-in-out font-medium leading-4 md:leading-7 relative`}
      onMouseEnter={animateArrow}
      onClick={handleClick}
    >
      <span className="">{label}</span>
      <div
        className={`'absolute right-0 transition-all ease-in-out duration-500 ${arrowClass}`}
      >
        <RightArrowIcon color={arrowColor} />
      </div>
    </button>
  );
}
