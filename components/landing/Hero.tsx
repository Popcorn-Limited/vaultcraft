import { networthAtom, tvlAtom, vaultronAtom } from "@/lib/atoms";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { useAtom } from "jotai";
import LargeCardStat from "@/components/common/LargeCardStat";

export default function Hero(): JSX.Element {
  const [networth] = useAtom(networthAtom)
  const [tvl] = useAtom(tvlAtom)
  const [vaultronStats] = useAtom(vaultronAtom)

  return (
    <section className="pb-8 pt-8 sm:pb-6 border-b border-customGray300">
      <div className="w-full px-4 md:px-8 md:flex flex-row items-center">
        <div className="w-full xl:w-2/3 md:flex md:flex-row space-y-4 md:space-y-0 mt-4 md:mt-0">
          <div className="flex flex-row items-center md:pr-10 gap-10 md:w-fit">
            <LargeCardStat
              id="networth-deposits"
              label="Deposits"
              value={`$ ${networth.vault > 0.01 ? NumberFormatter.format(networth.vault) : "0"}`}
              tooltip=""
            />
            <LargeCardStat
              id="networth-staked"
              label="Staked"
              value={`$ ${networth.stake > 0.01 ? NumberFormatter.format(networth.stake) : "0"}`}
              tooltip=""
            />
          </div>

          <div className="flex flex-row items-center md:pr-10 gap-10 md:w-fit">
            <LargeCardStat
              id="networth-wallet"
              label="Wallet"
              value={`$ ${networth.wallet > 0.01 ? NumberFormatter.format(networth.wallet) : "0"}`}
              tooltip=""
            />
            <LargeCardStat
              id="networth-total"
              label="Net Worth"
              value={`$ ${networth.stake > 0.01 ? NumberFormatter.format(networth.stake) : "0"}`}
              tooltip=""
            />
          </div>
          <div className="flex flex-row items-center md:w-fit">
            <LargeCardStat
              id="networth-xp"
              label="XP"
              value={`${vaultronStats.xp} XP`}
              tooltip=""
            />
          </div>
        </div>

        <div className="w-full xl:w-1/3 mt-8 md:mt-0">
          <p className="uppercase md:hidden text-customGray200 text-sm mb-2">
            Platform
          </p>
          <div className="w-full flex flex-row items-center md:justify-end">
            <div className="w-fit">
              <LargeCardStat
                id="tvl"
                label="Total Value Locked"
                value={`$ ${tvl.total > 0.01 ? NumberFormatter.format(tvl.total) : "0"}`}
                tooltip=""
              />
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </section>
  );
}
