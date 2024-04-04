import StatusWithLabel from "@/components/common/StatusWithLabel";
import { networthAtom, tvlAtom, vaultronAtom } from "@/lib/atoms";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { useAtom } from "jotai";

export default function Hero(): JSX.Element {
  const [networth] = useAtom(networthAtom)
  const [tvl] = useAtom(tvlAtom)
  const [vaultronStats] = useAtom(vaultronAtom)

  return (
    <section className="pb-8 pt-8 sm:pb-6 border-b border-customGray300">
      <div className="flex flex-col smmd:flex-row smmd:items-center justify-between mx-4 md:mx-8">
        <div className="w-full lg:w-8/12 md:flex md:flex-row space-y-4 md:space-y-0 mt-4 md:mt-0">
          <div className="flex flex-row items-center md:pr-10 gap-10 md:w-fit">
            <StatusWithLabel
              label={"Deposits"}
              content={
                <p className="text-3xl font-bold text-white leading-[120%]">
                  ${" "}
                  {
                    networth.vault > 0.01
                      ? NumberFormatter.format(networth.vault)
                      : "0"
                  }
                </p>
              }
              className="md:min-w-[160px] lg:min-w-0"
            />
            <StatusWithLabel
              label={"Staked"}
              content={
                <p className="text-3xl font-bold text-white leading-[120%]">
                  ${" "}
                  {
                    networth.stake > 0.01
                      ? NumberFormatter.format(networth.stake)
                      : "0"
                  }
                </p>
              }
              className="md:min-w-[160px] lg:min-w-0"
            />
            <StatusWithLabel
              label={"VCX in Wallet"}
              content={
                <p className="text-3xl font-bold text-white leading-[120%]">
                  ${" "}
                  {
                    networth.wallet > 0.01
                      ? NumberFormatter.format(networth.wallet)
                      : "0"
                  }
                </p>
              }
              className="md:min-w-[160px] lg:min-w-0"
            />
          </div>

          <div className="flex flex-row items-center md:pr-10 gap-10 md:w-fit">
            <StatusWithLabel
              label={"My Net Worth"}
              content={
                <p className="text-3xl font-bold text-white leading-[120%]">
                  ${" "}
                  {
                    networth.total > 0.01
                      ? NumberFormatter.format(networth.total)
                      : "0"
                  }
                </p>
              }
              infoIconProps={{
                id: "networth",
                title: "My Networth",
                content: (
                  <p>
                    This value aggregates your VaultCraft-related <br />{" "}
                    holdings across all blockchain networks.
                  </p>
                ),
              }}
              className="md:min-w-[160px] lg:min-w-0"
            />
            <StatusWithLabel
              label={"My XP"}
              content={
                <p className="text-3xl font-bold text-white leading-[120%]">
                  {vaultronStats.xp}
                </p>
              }
              infoIconProps={{
                id: "vaultronXp",
                title: "My XP",
                content: (
                  <p>
                    This value shows your Vaultron XP
                  </p>
                ),
              }}
              className="md:min-w-[160px] lg:min-w-0"
            />
          </div>
        </div>

        <div className="w-full md:w-fit-content mt-8 md:mt-0">
          <p className="uppercase md:hidden text-customGray200 text-sm mb-2">
            Platform
          </p>
          <div className="flex flex-row items-center w-full space-x-10">
            <StatusWithLabel
              label={"Total Value Locked"}
              content={
                <p className="text-3xl font-bold text-white leading-[120%]">
                  {
                    tvl.total > 0.01
                      ? NumberFormatter.format(tvl.total)
                      : "0"
                  }
                </p>
              }
              infoIconProps={{
                id: "tvl",
                title: "Total Value Locked",
                content: (
                  <p>
                    Total value locked (TVL) is the amount <br /> of user funds
                    deposited in VaultCraft products.
                  </p>
                ),
              }}
            />
          </div>
        </div>
      </div>
      <div></div>
    </section>
  );
}
