import React from "react";
import Product from "@/components/landing/Product";
import PopSmileyIcon from "@/components/svg/popcorn/PopSmileyIcon";
import PopIcon from "@/components/svg/popcorn/PopIcon";
import { useRouter } from "next/router";

export default function Products(): JSX.Element {
  const router = useRouter();

  return (
    <>
      <section className="py-12 md:py-10 mx-4 md:mx-0 h-max">
        <p className="text-2xl mb-6 text-white smmd:hidden"> Our products </p>
        <div className="flex flex-col gap-1 smmd:flex-wrap lg:flex-nowrap space-y-4 md:space-y-0 md:space-x-4 md:flex-row md:justify-between">
          <Product
            title={
              <div className="flex flex-row w-full justify-between items-end">
                <h2 className="text-white text-4xl md:text-6xl leading-none">
                  Smart <br className="hidden md:inline" />
                  Vaults
                </h2>
              </div>
            }
            customContent={
              <PopSmileyIcon
                size={"60"}
                color={"white"}
                className="group-hover:fill-secondaryFuchsia"
              />
            }
            description="Deposit and optimize your yield with automated, non-custodial DeFi strategies"
            route="vaults"
          />
          <Product
            title={
              <div className="flex flex-row w-full justify-between items-end">
                <h2 className="text-white text-4xl md:text-6xl leading-none">
                  Migrate <br className="hidden md:inline" />
                  VCX
                </h2>
              </div>
            }
            customContent={
              <PopIcon
                size={"60"}
                color={"white"}
                className="group-hover:fill-secondaryYellow"
              />
            }
            description="Migrate VCX to a new chain"
            route="migrate"
          />
        </div>
      </section>
    </>
  );
}