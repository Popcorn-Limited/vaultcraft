import ResponsiveTooltip from "@/components/common/Tooltip";
import { CardStatProps } from "@/components/common/CardStat";

export default function LargeCardStat({ id, label, value, secondaryValue, children, tooltip }: CardStatProps): JSX.Element {
  return (
    <div className="w-full">
      <p
        className="text-white font-normal whitespace-nowrap w-1/2 md:w-full"
        id={id}
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

      {tooltip !== "" &&
        <ResponsiveTooltip
          id={id}
          content={
            <p className="w-52">{tooltip}</p>
          }
        />
      }
    </div>
  )
}
