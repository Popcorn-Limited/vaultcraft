import NoSSR from "react-no-ssr";
import { useEffect, useState } from "react";
import {
  Address,
  useAccount,
  useBalance,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import useNetworkFilter from "@/lib/useNetworkFilter";
import SmartVault from "@/components/vault/SmartVault";
import NetworkFilter from "@/components/network/NetworkFilter";
import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards";
import MainActionButton from "@/components/button/MainActionButton";
import { useAtom } from "jotai";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { getVaultNetworthByChain } from "@/lib/getNetworth";
import VaultsSorting from "@/components/vault/VaultsSorting";
import { llama } from "@/lib/resolver/price/resolver";
import SearchBar from "@/components/input/SearchBar";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { MinterByChain, OptionTokenByChain, VCX } from "@/lib/constants";
import Modal from "@/components/modal/Modal";
import OptionTokenInterface from "@/components/boost/OptionTokenInterface";
import { Token, VaultData } from "@/lib/types";

interface VaultsContainerProps {
  hiddenVaults: Address[];
  displayVaults: Address[];
  showDescription?: boolean;
}

export default function VaultsContainer({
  hiddenVaults,
  displayVaults,
  showDescription = false,
}: VaultsContainerProps): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [vaultsData] = useAtom(vaultsAtom);
  const [vaults, setVaults] = useState<VaultData[]>([])

  useEffect(() => {
    if (Object.keys(vaultsData).length > 0) setVaults(SUPPORTED_NETWORKS.map(chain => vaultsData[chain.id]).flat())
  }, [vaultsData])

  const [tvl, setTvl] = useState<number>(0);
  const [networth, setNetworth] = useState<number>(0);

  const [gaugeRewards, setGaugeRewards] = useState<GaugeRewards>();
  const { data: oBal } = useBalance({
    chainId: 1,
    address: account,
    token: OptionTokenByChain[1],
    watch: true,
  });
  const [vcxPrice, setVcxPrice] = useState<number>(0);


  useEffect(() => {
    async function getAccountData() {
      // get gauge rewards
      if (account && vaults.length > 0) {
        const rewards = await getGaugeRewards({
          gauges: vaultsData[1]
            .filter((vault) => !!vault.gauge)
            .map((vault) => vault.gauge) as Address[],
          account: account as Address,
          chainId: 1,
          publicClient
        })
        setGaugeRewards(rewards)
        const vcxPriceInUsd = await llama({ address: VCX, chainId: 1 })
        setVcxPrice(vcxPriceInUsd)
      }
      setNetworth(
        SUPPORTED_NETWORKS.map((chain) =>
          getVaultNetworthByChain({ vaults: vaultsData[chain.id], chainId: chain.id })
        ).reduce((a, b) => a + b, 0)
      );
      setTvl(SUPPORTED_NETWORKS.map(chain => vaultsData[chain.id]).flat().reduce((a, b) => a + b.tvl, 0));
    }
    getAccountData();
  }, [account]);

  const [selectedNetworks, selectNetwork] = useNetworkFilter(
    SUPPORTED_NETWORKS.map((network) => network.id)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showOptionTokenModal, setShowOptionTokenModal] = useState(false);

  function handleSearch(value: string) {
    setSearchTerm(value);
  }

  return (
    <NoSSR >
      <Modal visibility={[showOptionTokenModal, setShowOptionTokenModal]}>
        <OptionTokenInterface
          gauges={
            vaults?.length > 0
              ? vaults
                .filter((vault) => !!vault.gauge?.address)
                .map((vault: VaultData) => vault.gauge as Token)
              : []
          }
        />
      </Modal>
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
              <p className="leading-6 text-base text-primaryDark md:text-primary">
                TVL
              </p>
              <div className="text-3xl font-bold whitespace-nowrap text-primary">
                {`$${NumberFormatter.format(tvl)}`}
              </div>
            </div>

            <div className="w-[120px] md:w-max">
              <p className="leading-6 text-base text-primaryDark md:text-primary">
                Deposits
              </p>
              <div className="text-3xl font-bold whitespace-nowrap text-primary">
                {`$${NumberFormatter.format(networth)}`}
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center md:gap-6 md:w-fit md:pl-12">
            <div className="flex gap-10 w-fit">
              <div className="w-[120px] md:w-max">
                <p className="w-max leading-6 text-base text-primaryDark md:text-primary">
                  My oVCX
                </p>
                <div className="w-max text-3xl font-bold whitespace-nowrap text-primary">
                  {`$${oBal && vcxPrice
                    ? NumberFormatter.format(
                      (Number(oBal?.value) / 1e18) * (vcxPrice * 0.25)
                    )
                    : "0"
                    }`}
                </div>
              </div>

              <div className="w-[120px] md:w-max">
                <p className="w-max leading-6 text-base text-primaryDark md:text-primary">
                  Claimable oVCX
                </p>
                <div className="w-max text-3xl font-bold whitespace-nowrap text-primary">
                  {`$${gaugeRewards && vcxPrice
                    ? NumberFormatter.format(
                      (Number(gaugeRewards?.total) / 1e18) *
                      (vcxPrice * 0.25)
                    )
                    : "0"
                    }`}
                </div>
              </div>
            </div>

            <div className="hidden align-bottom md:block md:mt-auto w-fit">
              <MainActionButton
                label="Claim oVCX"
                handleClick={() => setShowOptionTokenModal(true)}
              />
            </div>
          </div>
          <div className="md:hidden">
            <MainActionButton
              label="Claim oVCX"
              handleClick={() => setShowOptionTokenModal(true)}
            />
          </div>
        </div>
      </section>

      <section className="my-10 px-4 md:px-8 md:flex flex-row items-center justify-between">
        <NetworkFilter
          supportedNetworks={SUPPORTED_NETWORKS.map((chain) => chain.id)}
          selectNetwork={selectNetwork}
        />
        <div className="flex flex-row space-x-4">
          <SearchBar searchTerm={searchTerm} handleSearch={handleSearch} />
          <VaultsSorting className="" vaultState={[vaults, setVaults]} />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8">
        {vaults.length > 0 ? (
          <>
            {vaults
              .filter((vault) => selectedNetworks.includes(vault.chainId))
              .filter((vault) =>
                displayVaults.length > 0
                  ? displayVaults.includes(vault.address)
                  : true
              )
              .filter((vault) => !hiddenVaults.includes(vault.address))
              .sort((a, b) => b.tvl - a.tvl)
              .map((vault) => {
                return <SmartVault
                  key={`sv-${vault.address}-${vault.chainId}`}
                  vaultData={vault}
                  mutateTokenBalance={mutateTokenBalance}
                  searchTerm={searchTerm}
                  description={showDescription ? vault.metadata.description : undefined}
                />
              })
            }
          </>
        ) : (
          <p className="text-white">Loading Vaults...</p>
        )}
      </section>
    </NoSSR >
  )
}
