import React, { useEffect } from "react";
import DesktopMenu from "@/components/navbar/DesktopMenu";
import MobileMenu from "@/components/navbar/MobileMenu";
import { useDisconnect, useNetwork } from "wagmi";
import { useRouter } from "next/router";

export default function Navbar(): JSX.Element {
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  const { pathname } = useRouter();


  useEffect(() => {
    if (chain?.unsupported) {
      disconnect();
    }
  }, [chain]);

  return (
    <>
      <nav className={`hidden md:flex z-10 font-landing px-8 ${pathname === "/" ? "bg-[#FAF9F4]" : ""}`}>
        <DesktopMenu />
      </nav>
      <nav className="md:hidden w-screen h-full relative px-8">
        <MobileMenu />
      </nav>
    </>
  );
}
