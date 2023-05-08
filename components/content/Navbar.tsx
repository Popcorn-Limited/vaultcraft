import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import asset_logo from "@/assets/logo.png";

function Navbar() {
  return (
    <section className="bg-slate-400/5 border-b border-slate-100 p-4">
      <nav className="w-full max-w-screen-lg mx-auto flex justify-end">
        <figure className="w-16">
          <Image src={asset_logo} alt="" />
        </figure>
        <div className="flex-grow" />
        <ConnectButton />
      </nav>
    </section>
  );
}

export default Navbar;
