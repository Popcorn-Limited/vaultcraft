import React from "react";
import StatusWithLabel, {
  StatusWithLabelProps,
} from "@/components/common/StatusWithLabel";
import Link from "next/link";

export interface ProductProps {
  title: JSX.Element;
  description: string;
  route: string;
  stats?: StatusWithLabelProps[];
  customContent?: JSX.Element;
  badge?: string;
}

export default function Product({
  title,
  description,
  stats,
  badge,
  customContent,
  route,
}: ProductProps): JSX.Element {
  return (
    <Link
      href={route}
      className="group border rounded w-full lg:max-w-full h-[600px] relative flex flex-col bg-[#141416] border-[#353945] border-opacity-75 smmd:items-center py-6 px-8 md:mx-2 hover:shadow-lg ease-in-out duration-250 hover:bg-[#23262f]"
    >
      {badge && (
        <img
          src={badge}
          alt={`badge-${title}`}
          className="hidden w-16 md:inline-block absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
        />
      )}
      <div className="col-span-12 md:col-span-4 xs:self-start flex-1">
        <div className="relative flex flex-row">
          <h2 className="text-primary text-4xl md:text-[56px] leading-none mb-2">
            {title}
          </h2>
        </div>
        <p className="mt-2 text-primary">{description}</p>
      </div>

      <div className="flex absolute flex-grow items-center justify-end w-full top-[50%] translate-y-[-50%] right-8">
        {customContent}
      </div>
      <div className="flex justify-between w-full">
        {stats &&
          stats.map((stat, i) => (
            <StatusWithLabel
              key={i}
              content={stat.content}
              label={stat.label}
              infoIconProps={stat.infoIconProps}
            />
          ))}
      </div>
    </Link>
  );
}
