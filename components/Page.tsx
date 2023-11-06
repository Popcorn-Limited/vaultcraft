import DesktopMenu from "@/components/navbar/DesktopMenu";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { CachedProvider, YieldOptions } from "vaultcraft-sdk";

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
  const [yieldOptions, setYieldOptions] = useAtom(yieldOptionsAtom)

  useEffect(() => {
    if (!yieldOptions) {
      setUpYieldOptions().then((res: any) => setYieldOptions(res))
    }
  }, [])

  return (
    <>
      <div className="bg-[#141416] w-full mx-auto min-h-screen h-full font-khTeka flex flex-col">
        <DesktopMenu />
        <div>
          {children}
        </div>
      </div>
    </>
  );
}
