import { VAULTRON, VaultronAbi } from "@/lib/constants";
import { Address, PublicClient } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import axios from "axios"
import NoSSR from "react-no-ssr";
import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import MainActionButton from "@/components/button/MainActionButton";

const LevelNameByValue: { [key: number]: string } = {
  1: "Bronze",
  2: "Silver",
  3: "Gold"
}

interface VaultronStats {
  level: number;
  xp: number;
  animation: string;
}

async function fetchVaultron(account: Address, client: PublicClient): Promise<VaultronStats> {
  const tokenId = await client.readContract({
    address: VAULTRON,
    abi: VaultronAbi,
    functionName: "getActiveTokenId",
    args: [account]
  })
  const tokenURI = await client.readContract({
    address: VAULTRON,
    abi: VaultronAbi,
    functionName: "tokenURI",
    args: [tokenId]
  })
  const { data } = await axios.get(tokenURI)
  return { level: Number(data.properties.Level.value), xp: Number(data.properties.XP.value), animation: data.animation_url }
}

export default function Test() {
  const { address: account } = useAccount()
  const publicClient = usePublicClient({ chainId: 137 })
  const { openConnectModal } = useConnectModal();

  const [vaultronStats, setVaultronStats] = useState<VaultronStats>({ level: 0, xp: 0, animation: "" })

  useEffect(() => {
    if (account) {
      fetchVaultron("0xb6fBf1CC3a397815C7c00A83A2063782EAFD1036", publicClient)
        .then(res => setVaultronStats(res))
    }
  }, [account])


  return (
    <NoSSR>
      <section className="flex flex-row justify-between space-x-10 px-20 text-white">
        <div className="w-2/3">
          <img alt="Placeholder Vaultron" src="https://resolve.mercle.xyz/ipfs/bafkreibn26tzshouo6ayr33uhwwqzxpp5h6zgzitzgxwhsacsuuxoo7fuq" className="" />
        </div>
        <div className="w-1/3">
          <h1 className="text-4xl font-bold">
            {LevelNameByValue[vaultronStats.level]} VAULTRON
          </h1>

          <div className="w-full rounded-full border-white py-0.5 px-4">
            <div className="">
              My NFT
            </div>
          </div>

          <p>
            Your Vaultron NFT gives you access to XP points, airdrops and oVCX rewards. <span>View More</span>
          </p>

          <div>
            <p className="text-sm text-gray-400">Your Points</p>
            {account ?
              <div className="space-y-4 mt-2">
                <InfoRow label="Your XP" value={vaultronStats.xp} />
                <InfoRow label="Airdrop Boost" value={10_000} />
              </div>
              : <MainActionButton
                label="Connect Wallet"
                handleClick={openConnectModal}
              />
            }
          </div>
        </div>
      </section>
    </NoSSR>
  )
}


function InfoRow({ label, value }: { label: string, value: number }): JSX.Element {
  return <div className="flex flex-row items-center pb-0.5 border-b border-gray-600">
    <img
      src={"/images/tokens/vcx.svg"}
      alt="VCX"
      className="w-6 md:w-12 h-6 md:h-12 object-contain rounded-full"
    />
    <div>
      <p className="text-sm text-gray-400">
        {label}
      </p>
      <p className="font-bold text-2xl text-white">
        {value}
      </p>
    </div>
  </div>
}