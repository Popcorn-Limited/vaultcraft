import InfoIconWithTooltip from "@/components/common/InfoIconWithTooltip";

interface InfoIconProps {
  id: string;
  title: string;
  content: JSX.Element | React.ReactElement;
}

export interface StatusWithLabelProps {
  content: string | JSX.Element | React.ReactElement;
  label: string | JSX.Element;
  infoIconProps?: InfoIconProps | null;
  green?: boolean;
  isSmall?: boolean;
  className?: string;
}

export default function StatusWithLabel({
  content,
  label,
  green = false,
  infoIconProps = null,
  isSmall = false,
  className = "",
}: StatusWithLabelProps): JSX.Element {
  return (
    <div className={`flex flex-col ${className}`}>
      {infoIconProps ? (
        <span className="flex flex-row items-center">
          <p className="text-[#C8C8C8]">{label}</p>
          <div className="ml-2 mt-0">
            <InfoIconWithTooltip
              classExtras="text-[#969696]"
              id={infoIconProps.id}
              title={infoIconProps.title}
              content={infoIconProps.content}
            />
          </div>
        </span>
      ) : (
        <p className="text-[#C8C8C8]">{label}</p>
      )}
      {content == "Coming Soon" || typeof content !== "string" ? (
        <div
          className={`mt-2 text-primary font-normal text-2xl ${
            !isSmall && "md:text-3xl"
          } leading-6 ${!isSmall && "md:leading-8"}`}
        >
          {content}
        </div>
      ) : (
        <p
          className={`mt-2 text-primary font-normal text-2xl ${
            !isSmall && "md:text-3xl"
          } leading-6  ${!isSmall && "md:leading-8"} `}
        >
          {content.split(" ")[0]}{" "}
          <span className=" text-[#C8C8C8] text-xl">
            {" "}
            {content.split(" ")[1]}
          </span>
        </p>
      )}
    </div>
  );
}
