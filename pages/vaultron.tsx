import { useAccount } from "wagmi";
import NoSSR from "react-no-ssr";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { useAtom } from "jotai";
import { vaultronAtom } from "@/lib/atoms";

const AIRDROP_VCX = 1_000_000

const LevelNameByValue: { [key: number]: string } = {
  1: "Bronze",
  2: "Silver",
  3: "Gold"
}

export default function Vaultron() {
  const { address: account } = useAccount()
  const { openConnectModal } = useConnectModal();

  const [vaultronStats] = useAtom(vaultronAtom)

  function handleMercle(tokenId: number) {
    if (!window) return
    if (tokenId === 0) {
      // @ts-ignore
      window.open("https://app.mercle.xyz/vaultcraft/events", '_blank').focus()
    } else {
      // @ts-ignore
      window.open("https://app.mercle.xyz/vaultcraft/events/profile", '_blank').focus()
    }
  }

  function handleOpensea(tokenId: number) {
    if (!window) return
    if (tokenId === 0) {
      // @ts-ignore
      window.open("https://opensea.io/collection/vaultcraftvaultronnft", '_blank').focus()
    } else {
      // @ts-ignore
      window.open(`https://opensea.io/assets/matic/0x590e3a9260ffb7887ffd54a57d1facf7db59c751/${tokenId}`, '_blank').focus()
    }
  }

  return (
    <NoSSR>
      <section className="md:flex md:flex-row md:justify-between w-full lg:w-10/12 px-4 md:mx-auto text-white">
        <div className="w-full md:w-1/2 xl:w-2/3">
          {vaultronStats.animation === "" ?
            <img
              alt="Placeholder Vaultron"
              src="https://resolve.mercle.xyz/ipfs/bafkreibn26tzshouo6ayr33uhwwqzxpp5h6zgzitzgxwhsacsuuxoo7fuq"
              className="w-[50rem] h-[50rem] rounded-2xl object-none blur-md"
            />
            :
            <iframe
              src={vaultronStats.animation}
              className="w-full h-84 rounded-2xl xl:w-[50rem] lg:h-[50rem]"
            />
          }
        </div>
        <div className="w-full md:w-5/12 xl:w-1/3 mt-8 md:mt-0">
          <h1 className="text-3xl md:text-5xl font-bold">
            {LevelNameByValue[vaultronStats.level]} Vaultron
          </h1>

          <div className="w-full flex flex-row items-center justify-between rounded-full border border-white mt-2 py-2 px-2">
            <VaultronLevel label="None" active={vaultronStats.level === 0} />
            <VaultronLevel label="Bronze" active={vaultronStats.level === 1} />
            <VaultronLevel label="Silver" active={vaultronStats.level === 2} />
            <VaultronLevel label="Gold" active={vaultronStats.level === 3} />
          </div>

          <p className="mt-16">
            Your Vaultron NFT gives you access to XP points, airdrops, and oVCX rewards.
          </p>

          <div className="mt-16">
            <p className="text-sm text-customGray400">Your Points</p>
            {account ?
              <div className="space-y-4 mt-2">
                <InfoRow label="Your XP" value={vaultronStats.xp} />
                <InfoRow label="Airdrop Boost" value={vaultronStats.totalXp > 0 ? (vaultronStats.xp / vaultronStats.totalXp) * AIRDROP_VCX : 0} />
              </div>
              : <MainActionButton
                label="Connect Wallet"
                handleClick={openConnectModal}
              />
            }
          </div>

          <div className="flex flex-row items-center space-x-4 rounded-2xl border border-customNeutral100 bg-customNeutral200 p-6 mt-16">
            <MainActionButton
              label="View on Mercle"
              handleClick={() => handleMercle(vaultronStats.tokenId)}
            />
            <SecondaryActionButton
              label="View on Opensea"
              handleClick={() => handleOpensea(vaultronStats.tokenId)}
            />
          </div>
        </div>
      </section>
    </NoSSR>
  )
}


function InfoRow({ label, value }: { label: string, value: number }): JSX.Element {
  return <div className="flex flex-row items-center pb-1 border-b border-gray-600">
    <img
      src={"/images/tokens/vcx.svg"}
      alt="VCX"
      className="w-12 h-12 object-contain rounded-full mr-4"
    />
    <div>
      <p className="text-sm text-customGray400">
        {label}
      </p>
      <p className="font-bold text-2xl text-white">
        {value}
      </p>
    </div>
  </div>
}

function VaultronLevel({ label, active }: { label: string, active: boolean }): JSX.Element {
  return (
    <div className={`px-2 py-1 rounded-full w-20 text-center font-bold ${active ? "text-black bg-white" : "text-customGray400"}`}>
      <p className="mt-0.5">{label}</p>
    </div>
  )
}