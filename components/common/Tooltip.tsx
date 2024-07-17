import { keccak256, toHex } from "viem";
import { PropsWithChildren } from "react";
import { Tooltip } from "react-tooltip";

export default function ResponsiveTooltip({
  id,
  content,
}: {
  id: string;
  content: JSX.Element | React.ReactElement;
}): JSX.Element {
  return (
    <>
      <div className="hidden md:block">
        <Tooltip
          anchorSelect={`#${id}`}
          place="bottom"
          style={{
            backgroundColor: "#353945",
            borderRadius: "8px",
            zIndex: "50",
          }}
          border="1px solid #555555"
          opacity={1}
        >
          {content}
        </Tooltip>
      </div>
      <div className="md:hidden">
        <Tooltip
          anchorSelect={`#${id}`}
          openOnClick
          place="bottom"
          style={{
            backgroundColor: "#353945",
            borderRadius: "8px",
            zIndex: "50",
          }}
          border="1px solid #555555"
          opacity={1}
        >
          {content}
        </Tooltip>
      </div>
    </>
  );
}

export const WithTooltip = ({
  children,
  content,
  tooltipChild,
  subId,
}: PropsWithChildren<{
  content: string;
  tooltipChild?: JSX.Element;
  subId?: string;
}>) => {
  const id = `tooltip-${keccak256(toHex(content)).slice(2, 10)}${subId ?? ""}`;

  return (
    <span role="button" className="cursor-pointer" id={id}>
      {children}
      <ResponsiveTooltip
        id={id}
        content={
          tooltipChild
            ? tooltipChild
            : <p className="max-w-[20rem] !text-sm whitespace-normal text-left">
              {content}
            </p>
        }
      />
    </span>
  );
};
