import DesktopMenu from "@/components/navbar/DesktopMenu";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { getVaultsByChain } from "@/lib/vault/getVault";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { CachedProvider, YieldOptions } from "vaultcraft-sdk";
import { useAccount } from "wagmi";

async function setUpYieldOptions() {
  const ttl = 360_000;
  const provider = new CachedProvider();
  await provider.initialize("https://raw.githubusercontent.com/Popcorn-Limited/apy-data/main/apy-data.json");

  return new YieldOptions(provider, ttl);
}

export default function Page({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const { address: account } = useAccount()
  const [yieldOptions, setYieldOptions] = useAtom(yieldOptionsAtom)
  const [, setVaults] = useAtom(vaultsAtom)

  useEffect(() => {
    if (!yieldOptions) {
      setUpYieldOptions().then((res: any) => setYieldOptions(res))
    }
  }, [])

  useEffect(() => {
    async function getVaults() {
      // get vaults
      const fetchedVaults = (await Promise.all(
        SUPPORTED_NETWORKS.map(async (chain) => getVaultsByChain({ chain, account }))
      )).flat();
      setVaults(fetchedVaults)
    }
    getVaults()
  }, [account])

  return (
    <>
      <div className="bg-[#141416] w-full mx-auto min-h-screen h-full font-khTeka flex flex-col">
        <DesktopMenu />
        <div>
          {children}
        </div>
        <div className="py-16"></div>
      </div>
    </>
  );
}
