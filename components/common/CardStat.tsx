import ResponsiveTooltip from "@/components/common/Tooltip";

export interface CardStatProps {
  id: string;
  label: string;
  value?: string;
  secondaryValue?: string;
  children?: JSX.Element;
  tooltip?: string | JSX.Element;
  tooltipChild?: JSX.Element;
}

export default function CardStat({
  id,
  label,
  value,
  secondaryValue,
  children,
  tooltip,
  tooltipChild,
}: CardStatProps): JSX.Element {
  return (
    <div
      className="w-full md:w-1/4 cursor-pointer flex flex-row md:block justify-between md:justify-normal mt-6 md:mt-0"
      id={id}
    >
      <p className="text-white font-normal w-1/2 md:w-full">{label}</p>
      {value ? (
        <div className="w-full flex flex-col items-end md:items-start">
          <p className="text-white text-xl leading-0 w-1/2 md:w-full text-end md:text-start">
            {value}
          </p>
          <p className={`text-sm text-customGray300 -mt-1`}>{secondaryValue}</p>
        </div>
      ) : (
        <>{children}</>
      )}

      {tooltip && tooltip !== "" && (
        <ResponsiveTooltip
          id={id}
          content={<p className="w-52">{tooltip}</p>}
        />
      )}
      {!tooltip && tooltipChild && (
        <ResponsiveTooltip id={id} content={tooltipChild} />
      )}
    </div>
  );
}
