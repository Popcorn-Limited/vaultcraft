import Link from "next/link"


const Cards = [
  {
    title: "Vaults",
    description: "Manage vaults...",
    link: "/manage/vaults"
  },
  {
    title: "Miscellaneous",
    description: "Adjust VCX Oracle, Bridge and other settings...",
    link: "/manage/misc"
  },
  {
    title: "Dashboard",
    description: "See all protocol stats in one page...",
    link: "/manage/dashboard"
  },
  {
    title: "Safe Vaults",
    description: "Manage Safe Vault withdrawals...",
    link: "/manage/safe"
  }
]

export default function ManagementPage() {
  return <div className="flex flex-row flex-wrap w-full">
    {Cards.map(card =>
      <Link
        key={card.title}
        href={card.link}
        className="w-1/2 p-5"
      >
        <div className="group border rounded-lg w-full h-80 relative flex flex-col bg-customNeutral300 border-customNeutral100 border-opacity-75 smmd:items-center
      py-6 px-8 hover:shadow-lg ease-in-out duration-250 hover:bg-customNeutral200"
        >
          <h2 className="mt-2 text-white text-3xl font-bold">
            {card.title}
          </h2>
          <p className="mt-2 text-white">{card.description}</p>
        </div>

      </Link>
    )}
  </div>
}