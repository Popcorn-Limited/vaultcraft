import { useRouter } from "next/router";
import NavbarLink from "@/components/navbar/NavbarLink";
import { isAddress } from "viem";
import CopyToClipboard from "react-copy-to-clipboard";
import { useAccount } from "wagmi";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";

const links: { label: string; url: string; onClick?: Function }[] = [
  {
    label: "Smart Vaults",
    url: "/vaults",
  },
  {
    label: "Lock Vaults",
    url: "/vaults/lock",
  },
  {
    label: "Boost Vaults",
    url: "/boost",
  },
  {
    label: "Create Vaults",
    url: "/create-vault",
  },
  {
    label: "Stats",
    url: "/stats",
  },
  {
    label: "Archive",
    url: "https://archive.pop.network/",
  },
  {
    label: "Buy VCX",
    url: "https://swap.cow.fi/#/1/swap/WETH/VCX",
  }
];

export default function NavbarLinks(): JSX.Element {
  const router = useRouter();
  const { query } = router;
  const { address: account } = useAccount();

  return (
    <>
      {
        links.map((link) => (
          <NavbarLink
            key={link.label}
            label={link.label}
            url={(!!query?.ref && isAddress(query.ref as string)) ? `${link.url}?ref=${query.ref}` : `${link.url}`}
            isActive={router.pathname === link.url}
          />
        ))
      }
      <CopyToClipboard
        text={`https://app.vaultcraft.io/vaults?ref=${account}`}
        onCopy={() => account
          ? showSuccessToast("Referal link copied!")
          : showErrorToast("Connect your Wallet to copy referal link")
        }
      >
        <p className="leading-5 text-lg text-black font-medium hover:font-bold transition-all ease-in-out delay-250 cursor-pointer">
          Copy Referal link
        </p>
      </CopyToClipboard>
    </>
  );
}
