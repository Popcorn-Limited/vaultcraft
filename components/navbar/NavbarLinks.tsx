import { useRouter } from "next/router"
import NavbarLink from "@/components/navbar/NavbarLink"

const links: { label: string, url: string, onClick?: Function }[] = [
  {
    label: "Smart Vaults",
    url: "/vaults",
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
    url: "/stats"
  },
]


export default function NavbarLinks(): JSX.Element {
  const router = useRouter()
  return <>{links.map(link => <NavbarLink key={link.label} label={link.label} url={link.url} isActive={router.pathname === link.url} />)}</>
}