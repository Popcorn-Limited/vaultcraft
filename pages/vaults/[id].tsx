import { vaultsAtom } from "@/lib/atoms/vaults";
import { Token, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import VaultInputs from "@/components/vault/VaultInputs";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { tokensAtom } from "@/lib/atoms";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import ManageLoanInterface from "@/components/lending/ManageLoanInterface";
import { VeTokenByChain, ZapAssetAddressesByChain } from "@/lib/constants";
import StrategyDescription from "@/components/vault/StrategyDescription";
import ApyChart from "@/components/vault/ApyChart";
import VaultHero from "@/components/vault/VaultHero";
import { isAddress, zeroAddress } from "viem";
import UserBoostSection from "@/components/vault/UserBoostSection";
import HtmlRenderer from "@/components/common/HtmlRenderer";

export default function Index() {
  const router = useRouter();
  const { query } = router;
  const [yieldOptions] = useAtom(yieldOptionsAtom);

  const [tokens] = useAtom(tokensAtom)
  const [vaults] = useAtom(vaultsAtom);
  const [vaultData, setVaultData] = useState<VaultData>();

  const [tokenOptions, setTokenOptions] = useState<Token[]>([]);
  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();


  useEffect(() => {
    if (Object.keys(query).length > 0 && Object.keys(vaults).length > 0) {
      const chainIdQuery = query?.chainId! as string
      const chainId = Number(chainIdQuery.replace("?", "").replace("&", ""))
      const foundVault = vaults[chainId].find(vault => vault.address === query?.id)
      if (foundVault) {
        const newTokenOptions = [
          tokens[chainId][foundVault.asset],
          tokens[chainId][foundVault.vault],
          ...ZapAssetAddressesByChain[chainId].filter(addr => foundVault.asset !== addr).map(addr => tokens[chainId][addr])
        ]

        setAsset(tokens[chainId][foundVault.asset])
        setVault(tokens[chainId][foundVault.vault])

        if (foundVault.gauge && foundVault.gauge !== zeroAddress) {
          setGauge(tokens[chainId][foundVault.gauge])
          newTokenOptions.push(tokens[chainId][foundVault.gauge])
        }
        setTokenOptions(newTokenOptions)
        setVaultData(foundVault)
      }
    }
  }, [vaults, query, vaultData, tokens]);

  const [showLoanManagementModal, setShowLoanManagementModal] = useState(false)

  return <NoSSR>
    {
      (vaultData && asset && vault && tokenOptions.length > 0) ? (
        <>
          {/* <ManageLoanInterface visibilityState={[showLoanManagementModal, setShowLoanManagementModal]} vaultData={vaultData} /> */}
          <div className="min-h-screen">
            <button
              className="border border-customGray500 rounded-lg flex flex-row items-center px-4 py-2 ml-4 md:ml-0 mt-10"
              type="button"
              onClick={() => router.push((!!query?.ref && isAddress(query.ref as string)) ? `/vaults?ref=${query.ref}` : "/vaults")}
            >
              <div className="w-5 h-5">
                <LeftArrowIcon color="#FFF" />
              </div>
              <p className="text-white leading-0 mt-1 ml-2">Back to Vaults</p>
            </button>

            <VaultHero
              vaultData={vaultData}
              asset={asset}
              vault={vault}
              gauge={gauge}
              showClaim
            />

            <section className="w-full md:flex md:flex-row md:justify-between md:space-x-8 py-10 px-4 md:px-0">
              <div className="w-full md:w-1/3">
                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <div className="bg-customNeutral300 px-6 py-6 rounded-lg">
                    <VaultInputs
                      vaultData={vaultData}
                      tokenOptions={tokenOptions}
                      chainId={vaultData.chainId}
                      hideModal={() => router.reload()}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 mt-8 md:mt-0 space-y-4">
                {gauge && gauge?.balance > 0 && Object.keys(tokens).length > 0 && (vaultData.gaugeData?.lowerAPR || 0) > 0 &&
                  <UserBoostSection vaultData={vaultData} gauge={gauge} veToken={tokens[vaultData.chainId][VeTokenByChain[vaultData.chainId]]} />
                }

                {/* <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold mb-4">Leverage Farm 🧑‍🌾</p>
                  <p className='text-white mb-4'>
                    The borrow modal allows liquidity providers to borrow against their collateral and deposit more into Smart Vaults, enhancing capital efficiency and premiums earned.
                  </p>
                  <div className="md:flex md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                    <div className="w-full md:w-60">
                      <SecondaryActionButton
                        label="Loan Management"
                        handleClick={() => setShowLoanManagementModal(true)}
                      />
                    </div>
                  </div>
                </div> */}

                {vaultData.apyData.apyHist.length > 0 && <ApyChart vault={vaultData} />}

                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">Information</p>
                  <div className="text-white">
                    {vaultData.metadata.description && vaultData.metadata.description.length > 0 && <HtmlRenderer htmlContent={vaultData.metadata.description} />}
                  </div>
                  <div className="md:flex md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-4">

                    <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                      <p className="text-white font-normal">Vault address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-white">
                          {vaultData.address.slice(0, 6)}...{vaultData.address.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={vaultData.address} onCopy={() => showSuccessToast("Vault address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                      <p className="text-white font-normal">Asset address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-white">
                          {vaultData.asset.slice(0, 6)}...{vaultData.asset.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={vaultData.asset} onCopy={() => showSuccessToast("Asset address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                    {vaultData.gauge && vaultData.gauge !== zeroAddress &&
                      <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                        <p className="text-white font-normal">Gauge address:</p>
                        <div className="flex flex-row items-center justify-between">
                          <p className="font-bold text-white">
                            {vaultData.gauge.slice(0, 6)}...{vaultData.gauge.slice(-4)}
                          </p>
                          <div className='w-6 h-6 group/gaugeAddress'>
                            <CopyToClipboard text={vaultData.gauge} onCopy={() => showSuccessToast("Gauge address copied!")}>
                              <Square2StackIcon className="text-white group-hover/gaugeAddress:text-primaryYellow" />
                            </CopyToClipboard>
                          </div>
                        </div>
                      </div>
                    }

                  </div>
                </div>

                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">Strategies</p>
                  {vaultData.strategies.map((strategy, i) =>
                    <StrategyDescription
                      key={`${strategy.resolver}-${i}`}
                      strategy={strategy}
                      asset={asset}
                      chainId={vaultData.chainId}
                      i={i}
                      stratLen={vaultData.strategies.length}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        </>
      )
        :
        <p className="text-white ml-4 md:ml-0">Loading...</p>
    }
  </NoSSR >
}