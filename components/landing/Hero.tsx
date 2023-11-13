import StatusWithLabel from "@/components/common/StatusWithLabel";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { Networth, getTotalNetworth, getVaultNetworthByChain } from "@/lib/getNetworth";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Address, useAccount } from "wagmi";

export default function Hero(): JSX.Element {
  const { address: account } = useAccount();
  const [vaults] = useAtom(vaultsAtom)
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
    async function fetchNetworth() {
      const vaultNetworth = SUPPORTED_NETWORKS.map(chain => getVaultNetworthByChain({ vaults, chainId: chain.id })).reduce((a, b) => a + b, 0)
      const totalNetworth = await getTotalNetworth({ account: account as Address })
      setNetworth({ ...totalNetworth.total, vault: vaultNetworth, total: totalNetworth.total.total + vaultNetworth });
      setLoading(false);
    }
    if (account && loading && vaults.length > 0) fetchNetworth()
  }, [account]);


  return (
    <section className="pb-8 pt-8 sm:pb-6 border-b border-[#AFAFAF]">
      <div className="flex flex-col gap-6 items-start lg:flex-row lg:items-center lg:justify-between mx-8">
        <div className="grid xs:grid-cols-2 xs:gap-x-[40px] xs:gap-y-2 smmd:grid-cols-3 gap-6 sm:flex-row">
          <StatusWithLabel
            label={"Deposits"}
            content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {loading ? "..." : NumberFormatter.format(networth.vault)}</p>}
            className="xs:min-w-0 smmd:min-w-[159px] lg:min-w-0"
          />
          <StatusWithLabel
            label={"Staked"}
            content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {loading ? "..." : NumberFormatter.format(networth.stake)}</p>}
            className="xs:min-w-0 smmd:min-w-[159px] lg:min-w-0"
          />
          <StatusWithLabel
            label={"POP in Wallet"}
            content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {loading ? "..." : NumberFormatter.format(networth.pop)}</p>}
            className="xs:min-w-0 smmd:min-w-[159px] lg:min-w-0"
          />
        </div>
        <div className="w-full md:w-fit-content">
          <p className="uppercase smmd:hidden text-[#C8C8C8] text-sm mb-2">Platform</p>
          <div className="flex flex-row items-center w-full space-x-10">
            <StatusWithLabel
              label={"Total Value Locked"}
              content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {tvl}</p>}
              infoIconProps={{
                id: "tvl",
                title: "Total Value Locked",
                content: <p>Total value locked (TVL) is the amount <br /> of user funds deposited in popcorn products.</p>,
              }}
            />
            <StatusWithLabel
              label={"My Net Worth"}
              content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {loading ? "..." : NumberFormatter.format(networth.total)}</p>}
              infoIconProps={{
                id: "networth",
                title: "My Networth",
                content: <p>This value aggregates your Popcorn-related <br /> holdings across all blockchain networks.</p>,
              }}
            />
          </div>
        </div>
      </div>
      <div></div>
    </section>
  );
}
