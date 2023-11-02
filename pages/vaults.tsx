// @ts-ignore
import NoSSR from "react-no-ssr";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import useNetworkFilter from "@/lib/useNetworkFilter";
import getVaultNetworth from "@/lib/vaults/getVaultNetworth";
import useVaultTvl from "@/lib/useVaultTvl";
import { getVaultsByChain } from "@/lib/vaults/getVault";
import { VaultData } from "@/lib/types";
import SmartVault from "@/components/vault/SmartVault";
import NetworkFilter from "@/components/network/NetworkFilter";

export const HIDDEN_VAULTS = ["0xb6cED1C0e5d26B815c3881038B88C829f39CE949", "0x2fD2C18f79F93eF299B20B681Ab2a61f5F28A6fF",
  "0xDFf04Efb38465369fd1A2E8B40C364c22FfEA340", "0xd4D442AC311d918272911691021E6073F620eb07", //@dev for some reason the live 3Crypto yVault isnt picked up by the yearnAdapter nor the yearnFactoryAdapter
  "0x8bd3D95Ec173380AD546a4Bd936B9e8eCb642de1", // Sample Stargate Vault
  "0xcBb5A4a829bC086d062e4af8Eba69138aa61d567", // yOhmFrax factory
  "0x9E237F8A3319b47934468e0b74F0D5219a967aB8", // yABoosted Balancer
  "0x860b717B360378E44A241b23d8e8e171E0120fF0", // R/Dai
]

const Vaults: NextPage = () => {
  const { address: account } = useAccount();

  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS.map(network => network.id));
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const vaultTvl = useVaultTvl();

  const [searchString, handleSearch] = useState("");

  useEffect(() => {
    async function getVaults() {
      setInitalLoad(true)
      if (account) setAccountLoad(true)
      const fetchedVaults = await Promise.all(
        SUPPORTED_NETWORKS.map(async (chain) => getVaultsByChain({ chain, account }))
      );
      setVaults(fetchedVaults.flat());
    }
    if (!account && !initalLoad) getVaults();
    if (account && !accountLoad) getVaults()
  }, [account])

  const [networth, setNetworth] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    if (account && loading)
      // fetch and set networth
      getVaultNetworth({ account }).then(res => {
        setNetworth(res.total);
        setLoading(false);
      });
  }, [account]);

  return (
    <NoSSR>
      <section className="md:pb-10 md:border-b border-[#353945] md:flex md:flex-row items-center justify-between py-10 px-8 smmd:py-6 md:gap-4 xs:pb-0">

        <div className="w-full md:w-max">
          <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-primary xs:text-3xl xs:leading-none">
            Smart Vaults
          </h1>
          <p className="text-primaryDark smmd:text-primary smmd:opacity-80">
            Automate your returns in single-asset deposit yield strategies.
          </p>
        </div>

        <div className="w-full md:w-3/4 md:max-w-3xl">
          <div
              className="smmd:flex smmd:mt-4 md:mt-0 smmd:flex-row smmd:items-center justify-end smmd:justify-between smmd:gap-5 xs:grid xs:grid-cols-2 xs:grid-rows-3 xs:gap-4 xs:mt-4"
          >
            <div>
              <p className="leading-6 text-base text-primaryDark smmd:text-primary">TVL</p>
              <div className="text-3xl font-bold whitespace-nowrap text-primary mt-2">
                {`$${NumberFormatter.format(vaultTvl)}`}
              </div>
            </div>

            <div>
              <p className="leading-6 text-base text-primaryDark smmd:text-primary">Deposits</p>
              <div className="text-3xl font-bold whitespace-nowrap text-primary mt-2">
                {`$${loading ? "..." : NumberFormatter.format(networth)}`}
              </div>
            </div>

            <div className="w-[1px] h-[55px] bg-[#353945] xs:hidden smmd:block" />

            <div>
              <p className="leading-6 text-base text-primaryDark smmd:text-primary">My oPOP</p>
              <div className="text-3xl font-bold whitespace-nowrap text-primary mt-2">
                {`$${NumberFormatter.format(vaultTvl)}`}
              </div>
            </div>

            <div>
              <p className="leading-6 text-base text-primaryDark smmd:text-primary">Claimable oPOP</p>
              <div className="text-3xl font-bold whitespace-nowrap text-primary mt-2">
                {`$${loading ? "..." : NumberFormatter.format(networth)}`}
              </div>
            </div>
            {/*TODO: ASK ABOUT MOVING TO COMPONENT*/}
            <button className="py-2.5 px-4 bg-primary rounded mt-auto font-bold xs:col-span-2 xs:mt-2 xs:max-h-12 smmd:mt-auto">
              Claim oPOP
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 mb-10 md:flex px-8 flex-row items-center justify-between xs:m-0 smmd:mt-12 smmd:mb-6 md:my-10">
        <NetworkFilter supportedNetworks={SUPPORTED_NETWORKS.map(chain => chain.id)} selectNetwork={selectNetwork} />
        <div className="md:w-96 flex px-6 py-3 items-center rounded-lg border border-gray-300 border-opacity-40 gap-2 smmd:mt-6 xs:mt-12 xs:mb-6">
          <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
          <input
            className="w-10/12 md:w-80 focus:outline-none border-0 text-gray-500 leading-none bg-transparent"
            type="text"
            placeholder="Search..."
            onChange={(e) => handleSearch(e.target.value.toLowerCase())}
            defaultValue={searchString}
          />
        </div>
      </section>

      <section className="flex flex-wrap max-w-[1600px] mx-auto justify-between gap-4 px-8">
        {vaults.length > 0 ? vaults.filter(vault => selectedNetworks.includes(vault.chainId)).filter(vault => !HIDDEN_VAULTS.includes(vault.address)).map((vault) => {
          return (
            <SmartVault
              key={`sv-${vault.address}-${vault.chainId}`}
              vaultData={vault}
              searchString={searchString}
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
