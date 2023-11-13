// @ts-ignore
import NoSSR from "react-no-ssr";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Address, useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import useNetworkFilter from "@/lib/useNetworkFilter";
import useVaultTvl from "@/lib/useVaultTvl";
import { getVaultsByChain } from "@/lib/vault/getVault";
import { Token, VaultData } from "@/lib/types";
import SmartVault from "@/components/vault/SmartVault";
import NetworkFilter from "@/components/network/NetworkFilter";
import { getVeAddresses } from "@/lib/utils/addresses";
import getZapAssets, { getAvailableZapAssets } from "@/lib/utils/getZapAssets";
import { ERC20Abi, VaultAbi } from "@/lib/constants";
import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards";
import MainActionButton from "@/components/button/MainActionButton";
import { claimOPop } from "@/lib/oPop/interactions";
import { WalletClient } from "viem";
import { useAtom } from "jotai";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { getVaultNetworthByChain } from "@/lib/getNetworth";

export const HIDDEN_VAULTS = ["0xb6cED1C0e5d26B815c3881038B88C829f39CE949", "0x2fD2C18f79F93eF299B20B681Ab2a61f5F28A6fF",
  "0xDFf04Efb38465369fd1A2E8B40C364c22FfEA340", "0xd4D442AC311d918272911691021E6073F620eb07", //@dev for some reason the live 3Crypto yVault isnt picked up by the yearnAdapter nor the yearnFactoryAdapter
  "0x8bd3D95Ec173380AD546a4Bd936B9e8eCb642de1", // Sample Stargate Vault
  "0xcBb5A4a829bC086d062e4af8Eba69138aa61d567", // yOhmFrax factory
  "0x9E237F8A3319b47934468e0b74F0D5219a967aB8", // yABoosted Balancer
  "0x860b717B360378E44A241b23d8e8e171E0120fF0", // R/Dai
  "0xBae30fBD558A35f147FDBaeDbFF011557d3C8bd2", // 50OHM - 50 DAI
  "0x759281a408A48bfe2029D259c23D7E848A7EA1bC", // yCRV
]

const { oPOP: OPOP } = getVeAddresses();

const NETWORKS_SUPPORTING_ZAP = [1]

export interface MutateTokenBalanceProps {
  inputToken: Address;
  outputToken: Address;
  vault: Address;
  chainId: number;
  account: Address;
}

const Vaults: NextPage = () => {
  const { address: account } = useAccount();
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS.map(network => network.id));
  const [vaults, setVaults] = useAtom(vaultsAtom)
  const [zapAssets, setZapAssets] = useState<{ [key: number]: Token[] }>({});
  const [availableZapAssets, setAvailableZapAssets] = useState<{ [key: number]: Address[] }>({})
  const vaultTvl = useVaultTvl();
  const [networth, setNetworth] = useState<number>(0);

  const [gaugeRewards, setGaugeRewards] = useState<GaugeRewards>()
  const { data: oBal } = useBalance({ chainId: 1, address: account, token: OPOP, watch: true })

  const [searchString, handleSearch] = useState("");

  useEffect(() => {
    async function getVaults() {
      setInitalLoad(true)
      if (account) setAccountLoad(true)
      // get zap assets
      const newZapAssets: { [key: number]: Token[] } = {}
      SUPPORTED_NETWORKS.forEach(async (chain) => newZapAssets[chain.id] = await getZapAssets({ chain, account }))
      setZapAssets(newZapAssets);

      // get available zapAddresses
      setAvailableZapAssets({ 1: await getAvailableZapAssets() })

      // get gauge rewards
      if (account) {
        const rewards = await getGaugeRewards({
          gauges: vaults.filter(vault => vault.gauge && vault.chainId === 1).map(vault => vault.gauge?.address) as Address[],
          account: account as Address,
          publicClient
        })
        setGaugeRewards(rewards)
      }
      setNetworth(SUPPORTED_NETWORKS.map(chain => getVaultNetworthByChain({ vaults, chainId: chain.id })).reduce((a, b) => a + b, 0));
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

  return (
    <NoSSR>
      <section className="md:border-b border-[#353945] md:flex md:flex-row items-center justify-between py-10 px-8 smmd:py-6 md:gap-4">

        <div className="w-full md:w-max">
          <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-primary xs:text-3xl xs:leading-none">
            Smart Vaults
          </h1>
          <p className="text-primaryDark smmd:text-primary smmd:opacity-80">
            Automate your returns in single-asset deposit yield strategies.
          </p>
        </div>

        <div className="w-full md:justify-end md:w-8/12 md:divide-x md:flex md:flex-row space-y-4 md:space-y-0 mt-4 md:mt-0">
          <div className="flex flex-row items-center md:pr-10 gap-10 md:w-fit">
            <div className="xs:w-[120px] md:w-max">
              <p className="leading-6 text-base text-primaryDark smmd:text-primary">TVL</p>
              <div className="text-3xl font-bold whitespace-nowrap text-primary">
                {`$${NumberFormatter.format(vaultTvl)}`}
              </div>
            </div>

            <div className="xs:w-[120px] md:w-max">
              <p className="leading-6 text-base text-primaryDark smmd:text-primary">Deposits</p>
              <div className="text-3xl font-bold whitespace-nowrap text-primary">
                {`$${NumberFormatter.format(networth)}`}
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center md:gap-6 md:w-fit md:pl-12">
            <div className="flex gap-10 w-fit">
              <div className="xs:w-[120px] md:w-max">
                <p className="w-max leading-6 text-base text-primaryDark smmd:text-primary">My oPOP</p>
                <div className="w-max text-3xl font-bold whitespace-nowrap text-primary">
                  {`${oBal ? NumberFormatter.format(Number(oBal?.value) / 1e18) : "0"}`}
                </div>
              </div>

              <div className="xs:w-[120px] md:w-max">
                <p className="w-max leading-6 text-base text-primaryDark smmd:text-primary">Claimable oPOP</p>
                <div className="w-max text-3xl font-bold whitespace-nowrap text-primary">
                  {`$${gaugeRewards ? NumberFormatter.format(Number(gaugeRewards?.total) / 1e18) : "0"}`}
                </div>
              </div>
            </div>

            <div className="align-bottom md:block md:mt-auto w-fit">
              <MainActionButton
                label="Claim oPOP"
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
              label="Claim oPOP"
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

      <section className="mt-8 mb-10 xs:m-0 smmd:mb-6 md:my-10 md:flex px-8 flex-row items-center justify-between">
        <NetworkFilter supportedNetworks={SUPPORTED_NETWORKS.map(chain => chain.id)} selectNetwork={selectNetwork} />
        <div className="md:w-96 flex px-6 py-3 items-center rounded-lg border border-gray-300 border-opacity-40 group/search hover:border-opacity-80 gap-2 smmd:mt-6 xs:mt-12 xs:mb-6 md:my-0">
          <MagnifyingGlassIcon className="w-8 h-8 text-gray-400 group-hover/search:text-gray-200" />
          <input
            className="w-10/12 md:w-80 focus:outline-none border-0 text-gray-500 focus:text-gray-200 leading-none bg-transparent"
            type="text"
            placeholder="Search..."
            onChange={(e) => handleSearch(e.target.value.toLowerCase())}
            defaultValue={searchString}
          />
        </div>
      </section>

      <section className="flex flex-wrap mx-auto justify-between gap-4 px-8 w-full">
        {vaults.length > 0 ? vaults.filter(vault => selectedNetworks.includes(vault.chainId)).filter(vault => !HIDDEN_VAULTS.includes(vault.address)).map((vault) => {
          return (
            <SmartVault
              key={`sv-${vault.address}-${vault.chainId}`}
              vaultData={vault}
              mutateTokenBalance={mutateTokenBalance}
              searchString={searchString}
              zapAssets={vault.chainId === 1 && availableZapAssets[1]?.includes(vault.asset.address) ? zapAssets[vault.chainId] : undefined}
              deployer={"0x22f5413C075Ccd56D575A54763831C4c27A37Bdb"}
            />
          )
        })
          : <p className="text-white">Loading Vaults...</p>
        }
      </section>
    </NoSSR >
  )
};

export default Vaults;
