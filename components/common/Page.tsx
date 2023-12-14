import DesktopMenu from "@/components/navbar/DesktopMenu";
import { masaAtom, yieldOptionsAtom } from "@/lib/atoms/sdk";
import { lockvaultsAtom, vaultsAtom } from "@/lib/atoms/vaults";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { getVaultsByChain } from "@/lib/vault/getVault";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { CachedProvider, YieldOptions } from "vaultcraft-sdk";
import { useAccount } from "wagmi";
import Footer from "@/components/common/Footer";
import { useMasaAnalyticsReact } from "@masa-finance/analytics-react";
import { useRouter } from "next/router";
import getLockVaultsByChain from "@/lib/vault/lockVault/getVaults";
import { Address, zeroAddress } from "viem";
import { arbitrum } from "viem/chains";

async function setUpYieldOptions() {
  const ttl = 360_000;
  const provider = new CachedProvider();
  await provider.initialize("https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/apy-data.json");

  return new YieldOptions({ provider, ttl });
}

export default function Page({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const { asPath, query } = useRouter()
  const { address: account } = useAccount()

  const [yieldOptions, setYieldOptions] = useAtom(yieldOptionsAtom)
  const [masaSdk, setMasaSdk] = useAtom(masaAtom)

  const [vaults, setVaults] = useAtom(vaultsAtom)
  const [, setLockVaults] = useAtom(lockvaultsAtom)

  const { fireEvent, fireLoginEvent, firePageViewEvent, fireConnectWalletEvent } = useMasaAnalyticsReact({
    clientApp: "VaultCraft",
    clientName: "VaultCraft",
    clientId: process.env.MASA_CLIENT_ID as string
  });

  useEffect(() => {
    void firePageViewEvent({ page: `https://app.vaultcraft.io${asPath}`, user_address: account, additionalEventData: { referral: query.ref } });
  }, [asPath])

  useEffect(() => {
    if (!yieldOptions) {
      setUpYieldOptions().then((res: any) => setYieldOptions(res))
    }
    if (!masaSdk) {
      setMasaSdk({
        fireEvent, fireLoginEvent, firePageViewEvent, fireConnectWalletEvent
      })
    }
  }, [])

  useEffect(() => {
    async function getVaults() {
      // get vaults
      const fetchedVaults = (await Promise.all(
        SUPPORTED_NETWORKS.map(async (chain) => getVaultsByChain({ chain, account: account || zeroAddress, yieldOptions: yieldOptions as YieldOptions }))
      )).flat();
      setVaults(fetchedVaults)

      const fetchedLockVaults = await getLockVaultsByChain({ chain: arbitrum, account: account || zeroAddress })
      setLockVaults(fetchedLockVaults)
    }
    if (yieldOptions) getVaults()
  }, [yieldOptions, account])

  return (
    <>
      <div className="bg-[#141416] w-full mx-auto min-h-screen h-full font-khTeka flex flex-col">
        <DesktopMenu />
        <div className="flex-1">
          {children}
        </div>
        <div className="py-10"></div>
        <Footer />
      </div>
    </>
  );
}
