import ResponsiveTooltip from "@/components/common/Tooltip";
import { CardStatProps } from "@/components/common/CardStat";

export default function LargeCardStat({ id, label, value, secondaryValue, children, tooltip, tooltipChild }: CardStatProps): JSX.Element {
  return (
    <div className="w-full cursor-pointer" id={id}>
      <p
        className="text-white font-normal whitespace-nowrap w-1/2 md:w-full"
      >
        {label}
      </p>
      {value ?
        <>
          <p className="text-3xl font-bold whitespace-nowrap text-white leading-0">
            {value}
          </p>
          <p className={`text-xl whitespace-nowrap text-customGray300 -mt-2`}>
            {secondaryValue}
          </p>
        </>
        : <>
          {children}
        </>
      }

      {
        tooltip && tooltip !== "" &&
        <ResponsiveTooltip
          id={id}
          content={
            <p className="w-52">{tooltip}</p>
          }
        />
      }
      {
        !tooltip && tooltipChild &&
        <ResponsiveTooltip
          id={id}
          content={tooltipChild}
        />
      }
    </div>
  )
}
