import { Tooltip } from 'react-tooltip'
import React from "react";

export interface InfoIconWithTooltipProps {
  title?: string;
  content: JSX.Element | React.ReactElement;
  id?: string;
  classExtras?: string;
}

export default function InfoIconWithTooltip({ title, content, id, classExtras }: InfoIconWithTooltipProps): JSX.Element {
  return (
    <>
      <div className="flex items-center" id={id}>
        <img
          src="/images/icons/tooltip.svg"
          className={`cursor-pointer text-white w-4 h-4 ${classExtras}`}
        />
      </div>
      <div className='hidden md:block'>
        <Tooltip
          anchorSelect={`#${id}`}
          place="bottom"
          style={{ backgroundColor: "#353945" }}
        >
          {content}
        </Tooltip>
      </div>
      <div className='md:hidden'>
        <Tooltip
          anchorSelect={`#${id}`}
          openOnClick
          place="bottom"
          style={{ backgroundColor: "#353945" }}
        >
          {content}
        </Tooltip>
      </div>
    </>
  );
};
