import StatusWithLabel from "@/components/common/StatusWithLabel";
import { lockvaultsAtom, vaultsAtom } from "@/lib/atoms/vaults";
import { Networth, getTotalNetworth, getVaultNetworthByChain } from "@/lib/getNetworth";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Address, useAccount } from "wagmi";

export default function Hero(): JSX.Element {
  const { address: account } = useAccount();
  const [vaults] = useAtom(vaultsAtom)
  const [lockVaults] = useAtom(lockvaultsAtom)

  const [networth, setNetworth] = useState<Networth>({ wallet: 0, stake: 0, vault: 0, total: 0 });
  const [tvl, setTvl] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchNetworth() {
      const vaultNetworth = SUPPORTED_NETWORKS.map(chain => getVaultNetworthByChain({ vaults, chainId: chain.id })).reduce((a, b) => a + b, 0)
      const lockVaultNetworth = lockVaults.reduce((a, b) => a + (b.vault.balance * b.vault.price / (10 ** b.vault.decimals)), 0)
      const totalNetworth = await getTotalNetworth({ account: account as Address })
      setNetworth({ ...totalNetworth.total, vault: vaultNetworth + lockVaultNetworth, total: totalNetworth.total.total + vaultNetworth + lockVaultNetworth });
      setLoading(false);
    }
    if (account && vaults.length > 0 && lockVaults.length > 0) fetchNetworth()
  }, [account]);

  useEffect(() => {
    const vaultTvl = vaults.reduce((a, b) => a + b.tvl, 0)
    const lockVaultTvl = lockVaults.reduce((a, b) => a + b.tvl, 0)
    setTvl(NumberFormatter.format(vaultTvl + lockVaultTvl))
  }, [vaults])


  return (
    <section className="pb-8 pt-8 sm:pb-6 border-b border-[#AFAFAF]">
      <div className="flex flex-col smmd:flex-row smmd:items-center justify-between mx-4 md:mx-8">
        <div className="flex flex-col sm:flex-row sm:space-x-28 smmd:space-x-10">
          <StatusWithLabel
            label={"Deposits"}
            content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {loading ? "..." : NumberFormatter.format(networth.vault)}</p>}
            className="md:min-w-[160px] lg:min-w-0"
          />
          <div className="flex flex-row space-x-28 smmd:space-x-10 items-center mt-4 sm:mt-0">
            <StatusWithLabel
              label={"Staked"}
              content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {loading ? "..." : NumberFormatter.format(networth.stake)}</p>}
              className="md:min-w-[160px] lg:min-w-0"
            />
            <StatusWithLabel
              label={"VCX in Wallet"}
              content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {loading ? "..." : NumberFormatter.format(networth.wallet)}</p>}
              className="md:min-w-[160px] lg:min-w-0"
            />
          </div>
        </div>
        <div className="w-full md:w-fit-content">
          <p className="uppercase md:hidden text-[#C8C8C8] text-sm mb-2">Platform</p>
          <div className="flex flex-row items-center w-full space-x-10">
            <StatusWithLabel
              label={"Total Value Locked"}
              content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {tvl}</p>}
              infoIconProps={{
                id: "tvl",
                title: "Total Value Locked",
                content: <p>Total value locked (TVL) is the amount <br /> of user funds deposited in VaultCraft products.</p>,
              }}
            />
            <StatusWithLabel
              label={"My Net Worth"}
              content={<p className="text-3xl font-bold text-primary leading-[120%]">$ {loading ? "..." : NumberFormatter.format(networth.total)}</p>}
              infoIconProps={{
                id: "networth",
                title: "My Networth",
                content: <p>This value aggregates your VaultCraft-related <br /> holdings across all blockchain networks.</p>,
              }}
            />
          </div>
        </div>
      </div>
      <div></div>
    </section>
  );
}
