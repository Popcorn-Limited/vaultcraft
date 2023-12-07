// @ts-ignore
import NoSSR from "react-no-ssr";
import { useEffect, useState } from "react";
import { Address, useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import useNetworkFilter from "@/lib/useNetworkFilter";
import { Token, VaultData } from "@/lib/types";
import SmartVault from "@/components/vault/SmartVault";
import NetworkFilter from "@/components/network/NetworkFilter";
import { getVeAddresses } from "@/lib/utils/addresses";
import getZapAssets, { getAvailableZapAssets } from "@/lib/utils/getZapAssets";
import { ERC20Abi, VCXAbi, VaultAbi } from "@/lib/constants";
import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards";
import MainActionButton from "@/components/button/MainActionButton";
import { claimOPop } from "@/lib/optionToken/interactions";
import { WalletClient } from "viem";
import { useAtom } from "jotai";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { getVaultNetworthByChain } from "@/lib/getNetworth";
import VaultsSorting, { VAULT_SORTING_TYPE } from "@/components/vault/VaultsSorting";
import { llama } from "@/lib/resolver/price/resolver";

interface VaultsContainerProps {
  hiddenVaults: Address[];
  displayVaults: Address[]
}

export interface MutateTokenBalanceProps {
  inputToken: Address;
  outputToken: Address;
  vault: Address;
  chainId: number;
  account: Address;
}

const { oVCX: OVCX, VCX } = getVeAddresses();

const NETWORKS_SUPPORTING_ZAP = [1, 137, 10, 42161, 56]

export default function VaultsContainer({ hiddenVaults, displayVaults }: VaultsContainerProps): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS.map(network => network.id));
  const [vaults, setVaults] = useAtom(vaultsAtom)
  const [zapAssets, setZapAssets] = useState<{ [key: number]: Token[] }>({});
  const [availableZapAssets, setAvailableZapAssets] = useState<{ [key: number]: Address[] }>({})
  const [tvl, setTvl] = useState<number>(0);
  const [networth, setNetworth] = useState<number>(0);

  const [gaugeRewards, setGaugeRewards] = useState<GaugeRewards>()
  const { data: oBal } = useBalance({ chainId: 1, address: account, token: OVCX, watch: true })
  const [vcxPrice, setVcxPrice] = useState<number>(0)

  const [searchString, handleSearch] = useState("");

  const [sortingType, setSortingType] = useState(VAULT_SORTING_TYPE.none)

  useEffect(() => {
    async function getVaults() {
      setInitalLoad(true)
      if (account) setAccountLoad(true)
      // get zap assets
      const newZapAssets: { [key: number]: Token[] } = {}
      SUPPORTED_NETWORKS.forEach(async (chain) => newZapAssets[chain.id] = await getZapAssets({ chain, account }))
      setZapAssets(newZapAssets);

      // get available zapAddresses
      setAvailableZapAssets({
        1: await getAvailableZapAssets(1),
        137: [],
        10: [],
        42161: [],
        56: []
        // 137: await getAvailableZapAssets(137),
        // 10: await getAvailableZapAssets(10),
        // 42161: await getAvailableZapAssets(42161),
        // 56: await getAvailableZapAssets(56)
      })

      // get gauge rewards
      if (account) {
        const rewards = await getGaugeRewards({
          gauges: vaults.filter(vault => vault.gauge && vault.chainId === 1).map(vault => vault.gauge?.address) as Address[],
          account: account as Address,
          publicClient
        })
        setGaugeRewards(rewards)
        const vcxPriceInUsd = await llama({ address: VCX, chainId: 1 })
        setVcxPrice(vcxPriceInUsd)
      }
      setNetworth(SUPPORTED_NETWORKS.map(chain => getVaultNetworthByChain({ vaults, chainId: chain.id })).reduce((a, b) => a + b, 0));
      setTvl(vaults.reduce((a, b) => a + b.tvl, 0))
    }
    if (!account && !initalLoad && vaults.length > 0) getVaults();
    if (account && !accountLoad && vaults.length > 0) getVaults()
  }, [account, initalLoad, accountLoad, vaults])


  async function mutateTokenBalance({ inputToken, outputToken, vault, chainId, account }: MutateTokenBalanceProps) {
    const data = await publicClient.multicall({
      contracts: [
        {
          address: inputToken,
          abi: ERC20Abi,
          functionName: "balanceOf",
          args: [account]
        },
        {
          address: outputToken,
          abi: ERC20Abi,
          functionName: "balanceOf",
          args: [account]
        },
        {
          address: vault,
          abi: VaultAbi,
          functionName: 'totalAssets'
        },
        {
          address: vault,
          abi: VaultAbi,
          functionName: 'totalSupply'
        }],
      allowFailure: false
    })

    // Modify zap assets
    if (NETWORKS_SUPPORTING_ZAP.includes(chainId)) {
      const zapAssetFound = zapAssets[chainId].find(asset => asset.address === inputToken || asset.address === outputToken) // @dev -- might need to copy the state here already to avoid modifing a pointer
      if (zapAssetFound) {
        zapAssetFound.balance = zapAssetFound.address === inputToken ? Number(data[0]) : Number(data[1])
        setZapAssets({ ...zapAssets, [chainId]: [...zapAssets[chainId], zapAssetFound] })
      }
    }

    // Modify vaults, assets and gauges
    const newVaultState: VaultData[] = [...vaults]
    newVaultState.forEach(vaultData => {
      if (vaultData.chainId === chainId) {
        // Modify vault pricing and tvl
        if (vaultData.address === vault) {
          const assetsPerShare = Number(data[3]) > 0 ? Number(data[2]) / Number(data[3]) : Number(1e-9)
          const pricePerShare = assetsPerShare * vaultData.assetPrice

          vaultData.totalAssets = Number(data[2])
          vaultData.totalSupply = Number(data[3])
          vaultData.assetsPerShare = assetsPerShare
          vaultData.pricePerShare = pricePerShare
          vaultData.tvl = (Number(data[3]) * pricePerShare) / (10 ** vaultData.asset.decimals)
          vaultData.vault.price = pricePerShare * 1e9

          if (vaultData.gauge) vaultData.gauge.price = pricePerShare * 1e9
        }
        // Adjust vault balance
        if (vaultData.vault.address === inputToken || vaultData.vault.address === outputToken) {
          vaultData.vault.balance = vaultData.vault.address === inputToken ? Number(data[0]) : Number(data[1])
        }
        // Adjust asset balance
        if (vaultData.asset.address === inputToken || vaultData.asset.address === outputToken) {
          vaultData.asset.balance = vaultData.asset.address === inputToken ? Number(data[0]) : Number(data[1])
        }
        // Adjust gauge balance
        if (vaultData.gauge?.address === inputToken || vaultData.gauge?.address === outputToken) {
          vaultData.gauge.balance = vaultData.gauge.address === inputToken ? Number(data[0]) : Number(data[1])
        }
      }
    })
    setVaults(newVaultState)
  }

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
    const sortedVaults = [...vaults].sort((a, b) => b.apy - a.apy);
    setSortingType(VAULT_SORTING_TYPE.mostvAPR)
    setVaults(sortedVaults)
  }

  const sortByDescendingApy = () => {
    const sortedVaults = [...vaults].sort((a, b) => a.apy - b.apy);
    setSortingType(VAULT_SORTING_TYPE.lessvAPR)
    setVaults(sortedVaults)
  }

  return (
    <NoSSR>
      <section className="md:border-b border-[#353945] md:flex md:flex-row items-center justify-between py-10 px-4 md:px-8 md:gap-4">

        <div className="w-full md:w-max">
          <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-primary md:text-3xl leading-none">
            Smart Vaults
          </h1>
          <p className="text-primaryDark md:text-primary md:opacity-80">
            Automate your returns in single-asset deposit yield strategies.
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

          <div className="flex flex-row items-center md:gap-6 md:w-fit md:pl-12">
            <div className="flex gap-10 w-fit">
              <div className="w-[120px] md:w-max">
                <p className="w-max leading-6 text-base text-primaryDark md:text-primary">My oVCX</p>
                <div className="w-max text-3xl font-bold whitespace-nowrap text-primary">
                  {`$${oBal && vcxPrice ? NumberFormatter.format((Number(oBal?.value) / 1e18) * (vcxPrice * 0.25)) : "0"}`}
                </div>
              </div>

              <div className="w-[120px] md:w-max">
                <p className="w-max leading-6 text-base text-primaryDark md:text-primary">Claimable oVCX</p>
                <div className="w-max text-3xl font-bold whitespace-nowrap text-primary">
                  {`$${gaugeRewards && vcxPrice ? NumberFormatter.format((Number(gaugeRewards?.total) / 1e18) * (vcxPrice * 0.25)) : "0"}`}
                </div>
              </div>
            </div>

            <div className="hidden align-bottom md:block md:mt-auto w-fit">
              <MainActionButton
                label="Claim oVCX"
                handleClick={() =>
                  claimOPop({
                    gauges: gaugeRewards?.amounts?.filter(gauge => Number(gauge.amount) > 0).map(gauge => gauge.address) as Address[],
                    account: account as Address,
                    clients: { publicClient, walletClient: walletClient as WalletClient }
                  })}
              />
            </div>
          </div>
          <div className="md:hidden">
            <MainActionButton
              label="Claim oVCX"
              handleClick={() =>
                claimOPop({
                  gauges: gaugeRewards?.amounts?.filter(gauge => Number(gauge.amount) > 0).map(gauge => gauge.address) as Address[],
                  account: account as Address,
                  clients: { publicClient, walletClient: walletClient as WalletClient }
                })}
            />
          </div>
        </div>
      </section>

      <section className="mt-8 mb-10 md:mb-6 md:my-10 md:flex px-4 md:px-8 flex-row items-center justify-between">
        <NetworkFilter supportedNetworks={SUPPORTED_NETWORKS.map(chain => chain.id)} selectNetwork={selectNetwork} />
        <div className="flex gap-4 justify-between md:justify-end">
          <div className="md:w-96 flex px-6 py-3 items-center rounded-lg border border-gray-300 border-opacity-40 group/search hover:border-opacity-80 gap-2 md:mt-6 mt-12 mb-6 md:my-0">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400 group-hover/search:text-gray-200" />
            <input
              className="w-10/12 md:w-80 focus:outline-none border-0 text-gray-500 focus:text-gray-200 leading-none bg-transparent"
              type="text"
              placeholder="Search..."
              onChange={(e) => handleSearch(e.target.value.toLowerCase())}
              defaultValue={searchString}
            />
          </div>
          <VaultsSorting className="md:mt-6 mt-12 mb-6 md:my-0" currentSortingType={sortingType} sortByLessTvl={sortByDescendingTvl} sortByMostTvl={sortByAscendingTvl} sortByLessApy={sortByDescendingApy} sortByMostApy={sortByAscendingApy} />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8">
        {(vaults.length > 0 && Object.keys(availableZapAssets).length > 0) ?
          vaults.filter(vault => selectedNetworks.includes(vault.chainId))
            .filter(vault => displayVaults.length > 0 ? displayVaults.includes(vault.address) : true)
            .filter(vault => !hiddenVaults.includes(vault.address))
            .map((vault) => {
              return (
                <SmartVault
                  key={`sv-${vault.address}-${vault.chainId}`}
                  vaultData={vault}
                  mutateTokenBalance={mutateTokenBalance}
                  searchString={searchString}
                  zapAssets={availableZapAssets[vault.chainId].includes(vault.asset.address) ? zapAssets[vault.chainId] : undefined}
                  deployer={"0x22f5413C075Ccd56D575A54763831C4c27A37Bdb"}
                />
              )
            })
          : <p className="text-white">Loading Vaults...</p>
        }
      </section>
    </NoSSR >
  )
}