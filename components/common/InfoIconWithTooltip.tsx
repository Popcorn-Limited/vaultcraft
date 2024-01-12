import React from "react";
import ResponsiveTooltip from './Tooltip';

export interface InfoIconWithTooltipProps {
  title?: string;
  content: JSX.Element;
  id: string;
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
      <ResponsiveTooltip id={id} content={content} />
    </>
  );
};
