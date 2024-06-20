import ResponsiveTooltip from "@/components/common/Tooltip";

export interface CardStatProps {
  id: string;
  label: string;
  value?: string;
  secondaryValue?: string;
  children?: JSX.Element;
  tooltip: string;
}

export default function CardStat({ id, label, value, secondaryValue, children, tooltip }: CardStatProps): JSX.Element {
  return <div className="w-full md:w-1/4 flex flex-row md:block justify-between md:justify-normal mt-6 md:mt-0">
    <p
      className="text-white font-normal w-1/2 md:w-full"
      id={id}
    >
      {label}
    </p>
    {value ?
      <div className="w-full flex flex-col items-end md:items-start">
        <p className="text-white text-xl leading-0 w-1/2 md:w-full text-end md:text-start">
          {value}
        </p>
        <p className={`text-sm text-customGray300 -mt-1`}>
          {secondaryValue}
        </p>
      </div>
      : <>
        {children}
      </>
    }

    <ResponsiveTooltip
      id={id}
      content={
        <p className="w-52">{tooltip}</p>
      }
    />
  </div>
}
