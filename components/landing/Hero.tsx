import StatusWithLabel from "@/components/common/StatusWithLabel";
import { Networth, getTotalNetworth } from "@/lib/getNetworth";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function Hero(): JSX.Element {
  const { address: account } = useAccount();
  const [networth, setNetworth] = useState<Networth>({ pop: 0, stake: 0, vault: 0, total: 0 });
  const [tvl, setTvl] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    // fetch and set tvl
    fetch("https://api.llama.fi/protocol/popcorn").then(
      res => res.json().then(
        res => setTvl(NumberFormatter.format(res.currentChainTvls.Ethereum + res.currentChainTvls.staking))
      ))
  }, [])

  useEffect(() => {
    if (account && loading)
      // fetch and set networth
      getTotalNetworth({ account }).then(res => {
        setNetworth(res.total);
        setLoading(false);
      });
  }, [account]);


  return (
    <section className="pb-8 pt-4 sm:pb-6 border-b border-[#AFAFAF]">
      <div className="flex flex-col gap-6 items-start lg:flex-row lg:items-center lg:justify-between mx-8 mt-8">
        <div className="grid xs:grid-cols-2 xs:gap-x-[40px] xs:gap-y-2 smmd:grid-cols-5 gap-6 sm:flex-row">
          <StatusWithLabel
            label={"Deposits"}
            content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {loading ? "..." : NumberFormatter.format(networth.vault)}</p>}
          />
          <StatusWithLabel
            label={"Staked"}
            content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {loading ? "..." : NumberFormatter.format(networth.stake)}</p>}
          />
          <StatusWithLabel
            label={"POP in Wallet"}
            content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {loading ? "..." : NumberFormatter.format(networth.pop)}</p>}
          />
        </div>
        <div>
            <p className="uppercase smmd:hidden text-[#C8C8C8] text-sm mb-2">Platform</p>
            <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center sm:space-x-10">
                <StatusWithLabel
                    label={"Total Value Locked"}
                    content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {tvl}</p>}
                    infoIconProps={{
                        id: "tvl",
                        title: "Total Value Locked",
                        content: "Total value locked (TVL) is the amount of user funds deposited in popcorn products.",
                    }}
                />
                <StatusWithLabel
                    label={"My Net Worth"}
                    content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {loading ? "..." : NumberFormatter.format(networth.total)}</p>}
                    infoIconProps={{
                        id: "networth",
                        title: "My Networth",
                        content: "This value aggregates your Popcorn-related holdings across all blockchain networks.",
                    }}
                />
            </div>
        </div>
      </div>
      <div></div>
    </section>
  );
}
