import { zeroAddress } from "viem"
import { useAccount } from "wagmi"
import LockVault from "@/components/vault/lockVault/LockVault"
import { useAtom } from "jotai"
import { lockvaultsAtom } from "@/lib/atoms/vaults"
import getLockVaultsByChain from "@/lib/vault/lockVault/getVaults"
import { arbitrum } from "viem/chains"
import NoSSR from "react-no-ssr"
import NetworkFilter from "@/components/network/NetworkFilter"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import VaultsSorting, { VAULT_SORTING_TYPE } from "@/components/vault/VaultsSorting"
import { useEffect, useState } from "react"
import { NumberFormatter } from "@/lib/utils/formatBigNumber"
import SearchBar from "@/components/input/SearchBar"


export default function Index(): JSX.Element {
  const { address: account } = useAccount();
  const [vaults, setVaults] = useAtom(lockvaultsAtom)

  const [tvl, setTvl] = useState<number>(0);
  const [networth, setNetworth] = useState<number>(0);

  useEffect(() => {
    if (vaults.length > 0) {
      setTvl(vaults.reduce((a, b) => a + b.tvl, 0))
      setNetworth(vaults.reduce((a, b) => a + (b.vault.balance * b.vault.price / (10 ** b.vault.decimals)), 0));
    }
  }, [vaults])

  async function mutateTokenBalance() {
    const newVaults = await getLockVaultsByChain({ chain: arbitrum, account: account || zeroAddress })
    setVaults(newVaults)
  }

  const [searchTerm, setSearchTerm] = useState("");

  function handleSearch(value: string) {
    setSearchTerm(value)
  }

  const [sortingType, setSortingType] = useState(VAULT_SORTING_TYPE.none)

  const sortByAscendingTvl = () => {
    const sortedVaults = [...vaults].sort((a, b) => b.tvl - a.tvl);
    setSortingType(VAULT_SORTING_TYPE.mostTvl)
    setVaults(sortedVaults)
  }

  const sortByDescendingTvl = () => {
    const sortedVaults = [...vaults].sort((a, b) => a.tvl - b.tvl);
    setSortingType(VAULT_SORTING_TYPE.lessTvl)
    setVaults(sortedVaults)
  }

  const sortByAscendingApy = () => {
    const sortedVaults = [...vaults].sort((a, b) => b.totalApy - a.totalApy);
    setSortingType(VAULT_SORTING_TYPE.mostvAPR)
    setVaults(sortedVaults)
  }

  const sortByDescendingApy = () => {
    const sortedVaults = [...vaults].sort((a, b) => a.totalApy - b.totalApy);
    setSortingType(VAULT_SORTING_TYPE.lessvAPR)
    setVaults(sortedVaults)
  }

  return (
    <NoSSR>
      <section className="md:border-b border-[#353945] md:flex md:flex-row items-center justify-between py-10 px-4 md:px-8 md:gap-4">

        <div className="w-full md:w-max">
          <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-primary md:text-3xl leading-none">
            Lock Vaults
          </h1>
          <p className="text-primaryDark md:text-primary md:opacity-80">
            Lock your assets in yield strategies and earn additional rewards on top!
          </p>
        </div>

        <div className="w-full md:justify-end md:w-8/12 md:divide-x md:flex md:flex-row space-y-4 md:space-y-0 mt-4 md:mt-0">
          <div className="flex flex-row items-center md:pr-10 gap-10 md:w-fit">
            <div className="w-[120px] md:w-max">
              <p className="leading-6 text-base text-primaryDark md:text-primary">TVL</p>
              <div className="text-3xl font-bold whitespace-nowrap text-primary">
                {`$${NumberFormatter.format(tvl)}`}
              </div>
            </div>

            <div className="w-[120px] md:w-max">
              <p className="leading-6 text-base text-primaryDark md:text-primary">Deposits</p>
              <div className="text-3xl font-bold whitespace-nowrap text-primary">
                {`$${NumberFormatter.format(networth)}`}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="my-10 px-4 md:px-8 md:flex flex-row items-center justify-between">
        <NetworkFilter supportedNetworks={[42161]} selectNetwork={() => { }} />
        <div className="flex flex-row space-x-4">
          <SearchBar searchTerm={searchTerm} handleSearch={handleSearch} />
          <VaultsSorting className="" currentSortingType={sortingType} sortByLessTvl={sortByDescendingTvl} sortByMostTvl={sortByAscendingTvl} sortByLessApy={sortByDescendingApy} sortByMostApy={sortByAscendingApy} />
        </div>
      </section>

      <div className="bg-red-500 mb-4 p-4 md:p-2 mt-2 mx-4 md:mx-8 rounded-lg flex flex-row justify-center">
        <div className="flex flex-row items-center justify-center">
          <p className="text-white font-bold md:mr-4">
            We found an issue with the claiming function. Deposits and Claims are disabled until further notice. You can still withdraw once your lock period is over.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8">

        {vaults.length > 0 ?
          vaults.map(vault => <LockVault
            key={vault.address}
            vaultData={vault}
            mutateTokenBalance={mutateTokenBalance}
            searchTerm={searchTerm}
          />
          )
          : <p className="text-white">Loading Vaults...</p>
        }
      </section>
    </NoSSR >
  )
}