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
          style={{ backgroundColor: "#353945", borderRadius: "8px", zIndex: "50" }}
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
          style={{ backgroundColor: "#353945", borderRadius: "8px", zIndex: "50" }}
          border="1px solid #555555"
          opacity={1}
        >
          {content}
        </Tooltip>
      </div>
    </>
  );
}
