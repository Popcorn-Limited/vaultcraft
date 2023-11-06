import React from "react";
import Product from "@/components/landing/Product";
import usetVaultTvl from "@/lib/useVaultTvl";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import PopSmileyIcon from "@/components/svg/popcorn/PopSmileyIcon";
import SmileyIcon from "@/components/svg/popcorn/SmileyIcon";
import HandIcon from "@/components/svg/popcorn/HandIcon";
import PopIcon from "@/components/svg/popcorn/PopIcon";

export default function Products(): JSX.Element {
  const vaultTvl = usetVaultTvl();
  return (
    <>
      {/* @dev Product.tsx has `md:mx-2` so with `md:mx-6` that adds up to consistent mx-8*/}
      <section className="py-12 smmd:py-10 mx-8 md:mx-6">
          <p className="text-2xl mb-6 text-primary smmd:hidden"> Our products </p>
        <div className="flex flex-col gap-6 smmd:flex-wrap lg:flex-nowrap space-y-4 md:space-y-0 md:flex-row md:justify-between">
          <Product
            title={
              <>
                Smart <br className="hidden md:inline" />
                Vaults
              </>
            }
            customContent={<PopSmileyIcon size={"60"} color={"white"} className="group-hover:fill-[#FFA0B4]" />}
            description="Single-asset vaults to earn yield on your digital assets "
            stats={[
              {
                label: "TVL",
                content: `$${NumberFormatter.format(vaultTvl)}`,
                infoIconProps: {
                  title: "Total Value Locked",
                  content: "The total value of assets held by the underlying smart contracts.",
                  id: "sweet-vault-tvl",
                },
              },
              {
                  label: "vAPR",
                  content: `${NumberFormatter.format(vaultTvl)}%`,
                  infoIconProps: {
                      title: "vAPR",
                      content: "Example",
                      id: "sweet-vault-vAPR",
                  },
              },
            ]}
            route="vaults"
          />
          <Product
            title={
              <>
                Boost <br className="hidden md:inline" />
                Vaults
              </>
            }
            customContent={<SmileyIcon size={"60"} color={"white"} className="group-hover:fill-[#C391FF]" />}
            description="Lock stake your POP LP to boost your rewards with call options on POP"
            stats={[
              {
                label: "TVL",
                content: <p>Coming soon</p>,
                infoIconProps: {
                    title: "TVL",
                    content: "Example",
                    id: "boost-vault-tvl",
                },
              },
            ]}
            route="vepop"
          />
          <Product
            title={
              <>
                VaultCraft
              </>
            }
            customContent={<HandIcon size={"60"} color={"white"} className="group-hover:fill-[#FFE650]" />}
            description="Create automated assets strategies within minutes"
            stats={[]}
            route="https://vaultcraft.io/"
          />
          <Product
            title={
              <>
                Staking
              </>
            }
            customContent={<PopIcon size={"60"} color={"white"} className="group-hover:fill-[#80FF77]" />}
            description="Find out our staking products & discontinued products here"
            stats={[]}
            route="https://archive.pop.network"
          />
        </div>
      </section>
    </>
  );
};
