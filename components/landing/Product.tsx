import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { isAddress } from "viem";
import LargeCardStat from "@/components/common/LargeCardStat";
import { CardStatProps } from "@/components/common/CardStat";

export interface ProductProps {
  title: JSX.Element;
  description: string;
  route: string;
  handleClick?: Function;
  stats?: CardStatProps[];
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
  handleClick,
}: ProductProps): JSX.Element {
  const router = useRouter();
  const { query } = router;

  return (
    <Link
      href={
        !!query?.ref && isAddress(query.ref as string)
          ? `${route}?ref=${query.ref}`
          : `/${route}`
      }
      // @ts-ignore
      onClick={handleClick ? handleClick : () => {}}
      className="group border rounded w-full lg:max-w-full min-h-[40rem] relative flex flex-col bg-customNeutral300 border-customNeutral100 border-opacity-75 smmd:items-center
      py-6 px-8 hover:shadow-lg ease-in-out duration-250 hover:bg-customNeutral200"
    >
      {badge && (
        <img
          src={badge}
          alt={`badge-${title}`}
          className="hidden w-16 md:inline-block absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
        />
      )}
      <div className="col-span-12 md:col-span-4 xs:self-start flex-1">
        <div className="relative flex flex-row">{title}</div>
        <p className="mt-2 text-white">{description}</p>
      </div>

      <div className="flex absolute flex-grow items-center justify-end w-full top-[50%] translate-y-[-50%] right-8">
        {customContent}
      </div>
      <div className="flex justify-between w-full">
        {stats &&
          stats.map((stat, i) => (
            <LargeCardStat
              key={stat.id}
              id={stat.id}
              label={stat.label}
              value={stat.value}
              tooltip={stat.tooltip}
            />
          ))}
      </div>
    </Link>
  );
}
