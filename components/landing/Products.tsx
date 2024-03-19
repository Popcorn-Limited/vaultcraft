import React, { useEffect, useState } from "react";
import Product from "@/components/landing/Product";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import PopSmileyIcon from "@/components/svg/popcorn/PopSmileyIcon";
import SmileyIcon from "@/components/svg/popcorn/SmileyIcon";
import HandIcon from "@/components/svg/popcorn/HandIcon";
import PopIcon from "@/components/svg/popcorn/PopIcon";
import { useAtom } from "jotai";
import { lockvaultsAtom, vaultsAtom } from "@/lib/atoms/vaults";
import Link from "next/link";

export default function Products(): JSX.Element {
  const [vaults] = useAtom(vaultsAtom);
  const [vaultTvl, setVaultTvl] = useState<number>(0);

  useEffect(() => {
    if (vaults) {
      setVaultTvl(vaults.reduce((a, b) => a + b.tvl, 0));
    }
  }, [vaults]);

  const [lockVaults] = useAtom(lockvaultsAtom);
  const [lockVaultTvl, setLockVaultTvl] = useState<number>(0);

  useEffect(() => {
    if (lockVaults) {
      setLockVaultTvl(lockVaults.reduce((a, b) => a + b.tvl, 0));
    }
  }, [lockVaults]);

  return (
    <>
      {/* @dev Product.tsx has `md:mx-2` so with `md:mx-6` that adds up to consistent mx-8*/}
      <section className="py-12 md:py-10 mx-4 md:mx-6">
        <p className="text-2xl mb-6 text-primary smmd:hidden"> Our products </p>
        <div className="flex flex-col gap-6 smmd:flex-wrap lg:flex-nowrap space-y-4 md:space-y-0 md:flex-row md:justify-between">
          <Product
            title={
              <>
                Smart <br className="hidden md:inline" />
                Vaults
              </>
            }
            customContent={
              <PopSmileyIcon
                size={"60"}
                color={"white"}
                className="group-hover:fill-[#FFA0B4]"
              />
            }
            description="Single-asset vaults to earn yield on your digital assets"
            stats={[
              {
                label: "TVL",
                content: `$${NumberFormatter.format(vaultTvl)}`,
                infoIconProps: {
                  title: "Total Value Locked",
                  content: (
                    <p>
                      The total value of assets held <br /> by the underlying
                      smart contracts.
                    </p>
                  ),
                  id: "smart-vault-tvl",
                },
              },
            ]}
            route="vaults"
          />
          <Product
            title={
              <>
                Lock <br className="hidden md:inline" />
                Vaults
              </>
            }
            customContent={
              <PopIcon
                size={"60"}
                color={"white"}
                className="group-hover:fill-[#80FF77]"
              />
            }
            description="Lock your assets in yield strategies and earn additional rewards on top!"
            stats={[
              {
                label: "TVL",
                content: `$${NumberFormatter.format(lockVaultTvl)}`,
                infoIconProps: {
                  title: "Total Value Locked",
                  content: (
                    <p>
                      The total value of assets held <br /> by the underlying
                      smart contracts.
                    </p>
                  ),
                  id: "lock-vault-tvl",
                },
              },
            ]}
            route="vaults/lock"
          />
          <Product
            title={
              <>
                Boost <br className="hidden md:inline" />
                Vaults
              </>
            }
            customContent={
              <SmileyIcon
                size={"60"}
                color={"white"}
                className="group-hover:fill-[#C391FF]"
              />
            }
            description="Lock stake your VCX-LP to boost your rewards with call options on VCX"
            stats={[]}
            route="boost"
          />
          <div className="w-full lg:max-w-full h-[600px] relative flex flex-col space-y-4 md:mx-2">
            <Link href="vaultron">
              <div className="rounded w-full md:h-[200px] h-[300px] bg-[#141416] border border-[#353945] border-opacity-75 py-6 px-8 md:mx-2 hover:shadow-lg ease-in-out duration-250 hover:bg-[#23262f] flex flex-col justify-end bg-local"
                style={{ backgroundImage: "url('images/vaultron.jpg')" }}
              >
                <h2 className="text-primary text-3xl leading-none mb-2">
                  Vaultron NFT
                </h2>
              </div>
            </Link>
            <Link
              href="create-vault"
              className="rounded w-full relative flex flex-col bg-[#141416] border border-[#353945] border-opacity-75 smmd:items-center py-6 px-8 md:mx-2 hover:shadow-lg ease-in-out duration-250 hover:bg-[#23262f]"
            >
              <div className="col-span-12 md:col-span-4 xs:self-start flex-1">
                <div className="relative flex flex-row">
                  <h2 className="text-primary text-3xl leading-none mb-2">
                    Create Vaults
                  </h2>
                </div>
                <p className="mt-2 text-primary">Create automated assets strategies within minutes</p>
              </div>
            </Link>
            <Link
              href="stats"
              className="rounded w-full relative flex flex-col bg-[#141416] border border-[#353945] border-opacity-75 smmd:items-center py-6 px-8 md:mx-2 hover:shadow-lg ease-in-out duration-250 hover:bg-[#23262f]"
            >
              <div className="col-span-12 md:col-span-4 xs:self-start flex-1">
                <div className="relative flex flex-row">
                  <h2 className="text-primary text-3xl leading-none mb-2">
                    VaultCraft Stats
                  </h2>
                </div>
                <p className="mt-2 text-primary">See all stats regarding VCX and VaultCraft</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
