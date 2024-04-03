import ResponsiveTooltip from "@/components/common/Tooltip";

export default function CardStat({ id, label, value, tooltip }: { id: string, label: string, value: string, tooltip: string }): JSX.Element {
  return <div className="w-full md:w-1/4 flex flex-row md:block justify-between md:justify-normal mt-6 md:mt-0">
    <p
      className="text-primary font-normal md:text-sm w-1/2 md:w-full"
      id={id}
    >
      {label}
    </p>
    <p className="text-primary text-xl leading-6 md:leading-8 w-1/2 md:w-full text-end md:text-start">
      {value}
    </p>
    <ResponsiveTooltip
      id={id}
      content={
        <p className="max-w-52">{tooltip}</p>
      }
    />
  </div>
}
