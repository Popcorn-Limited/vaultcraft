import Link from "next/link";
import React from "react";
import SocialMediaLinks from "@/components/common/SocialMediaLinks";

type FooterLink = {
  label: string;
  href: string;
};

const ProductLinks = [
  {
    label: "Smart Vaults",
    href: "/vaults",
  },
  {
    label: "Boost Vaults",
    href: "/boost",
  },
  {
    label: "Manage",
    href: "/manage",
  },
];

const GeneralLinks = [
  {
    label: "VaultCraft",
    href: "/",
  },
  {
    label: "Gitbook",
    href: "https://docs.vaultcraft.io/welcome-to-vaultcraft/introduction",
  },
  {
    label: "Disclaimer",
    href: "/disclaimer",
  },
  {
    label: "Dev Docs",
    href: "https://hackmd.io/yY8KpIVxQYGft6fHSxfHCg",
  },
];

const BugBountyLinks = [
  {
    label: "Immunefi",
    href: "https://immunefi.com/bounty/vaultcraft/",
  },
];

const GovernanceLinks = [
  {
    label: "Forum",
    href: "https://forum.vaultcraft.io/",
  },
  {
    label: "Snapshot",
    href: "https://snapshot.org/#/popcorn-snapshot.eth",
  },
];

const Footer = () => {
  return (
    <footer className="bg-customNeutral200">
      <section className="w-full container flex flex-col md:flex-row py-12 px-8">
        <div className="w-full md:w-1/4 md:mr-8">
          <div className="flex flex-row">
            <Link href={`/`} passHref>
              <img
                src="/images/icons/popLogo.svg"
                alt="Logo"
                className="hidden md:block w-10 h-10"
              />
            </Link>
            <p className="text-customGray100 leading-6 md:ml-10 md:w-11/12">
              VaultCraft is a DeFi yield-optimizing protocol with customizable
              asset strategies that instantly zap your crypto from any chain
              into the highest yield-generating products across DeFi in 1 click.
            </p>
          </div>
          <div className="flex flex-row space-x-6 mt-6 md:ml-18">
            <SocialMediaLinks color="#fff" color2="#23262F" size="24" />
          </div>
        </div>

        <div className="w-full md:w-3/4 flex flex-wrap md:flex-row mt-8 md:mt-0">
          <div className="w-1/2 md:w-1/4">
            <p className="text-white font-medium leading-6 tracking-1">
              Products
            </p>
            <div className="flex flex-col">
              {ProductLinks.map((link: FooterLink) => (
                <Link
                  key={link.label}
                  href={link.href}
                  passHref
                  className=" text-customGray100 hover:text-primaryGreen leading-6 mt-4"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="w-1/2 md:w-1/4">
            <p className="text-white font-medium leading-6 tracking-1">Links</p>
            <div className="flex flex-col">
              {GeneralLinks.map((link: FooterLink) => (
                <Link
                  key={link.label}
                  href={link.href}
                  passHref
                  target="_blank"
                  className=" text-customGray100 hover:text-primaryGreen leading-6 mt-4"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="w-1/2 md:w-1/4 mt-8 md:mt-0">
            <p className="text-white font-medium leading-6 tracking-1">
              Bug Bounty
            </p>
            <div className="flex flex-col">
              {BugBountyLinks.map((link: FooterLink) => (
                <Link
                  key={link.label}
                  href={link.href}
                  passHref
                  target="_blank"
                  className="text-customGray100 hover:text-primaryGreen leading-6 mt-4"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="w-1/2 md:w-1/4 mt-8 md:mt-0">
            <p className="text-white font-medium leading-6 tracking-1">
              Governance
            </p>
            <div className="flex flex-col">
              {GovernanceLinks.map((link: FooterLink) => (
                <Link
                  key={link.label}
                  href={link.href}
                  passHref
                  target="_blank"
                  className="text-customGray100 hover:text-primaryGreen leading-6 mt-4"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
