import { vaultsAtom } from "@/lib/atoms/vaults";
import { Token, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import VaultInputs from "@/components/vault/VaultInputs";
import { tokensAtom } from "@/lib/atoms";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import { VeTokenByChain, ZapAssetAddressesByChain } from "@/lib/constants";
import StrategyDescription from "@/components/vault/StrategyDescription";
import ApyChart from "@/components/vault/ApyChart";
import VaultHero from "@/components/vault/VaultHero";
import { isAddress, zeroAddress } from "viem";
import UserBoostSection from "@/components/vault/UserBoostSection";
import SpinningLogo from "@/components/common/SpinningLogo";
import SafeVaultInteraction from "@/components/vault/safe/SafeVaultInteraction";
import VaultInformation from "@/components/vault/VaultInformation";
import { addDynamicVaultData } from "@/lib/vault/prepareVaultData";
import { ChainById } from "@/lib/utils/connectors";

export default function Index() {
  const router = useRouter();
  const { query } = router;

  const [tokens] = useAtom(tokensAtom)
  const [vaults] = useAtom(vaultsAtom);
  const [vaultData, setVaultData] = useState<VaultData>();

  const [tokenOptions, setTokenOptions] = useState<Token[]>([]);
  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();
  const [foundVault, setFoundVault] = useState<VaultData>();

  useEffect(() => {
    async function updateVaultData(foundVault: VaultData, chainId: number) {
      console.log("UPDATING VAULT DATA", foundVault.address);
      const getDataStart = Number(new Date());

      const updatedVault = await addDynamicVaultData(foundVault, ChainById[chainId]);
      
      const newTokenOptions = [
        tokens[chainId][updatedVault.asset],
        tokens[chainId][updatedVault.vault],
        ...ZapAssetAddressesByChain[chainId].filter(addr => updatedVault.asset !== addr).map(addr => tokens[chainId][addr])
      ]

      setAsset(tokens[chainId][foundVault.asset])
      setVault(tokens[chainId][foundVault.vault])

      if (foundVault.gauge && foundVault.gauge !== zeroAddress) {
        setGauge(tokens[chainId][foundVault.gauge])
        newTokenOptions.push(tokens[chainId][foundVault.gauge])
      }
      setTokenOptions(newTokenOptions)
      setVaultData(foundVault)
      
      console.log(`Took ${Number(new Date()) - getDataStart}ms to update vault data`);
    }

    const chainIdQuery = query?.chainId! as string
    const chainId = Number(chainIdQuery.replace("?", "").replace("&", ""))

    if(foundVault)
      updateVaultData(foundVault, chainId)

  }, [foundVault])
  
  useEffect(() => {
    

    if (Object.keys(query).length > 0 && Object.keys(vaults).length > 0) {
      const chainIdQuery = query?.chainId! as string
      const chainId = Number(chainIdQuery.replace("?", "").replace("&", ""))
      const foundVault = vaults[chainId].find(vault => vault.address === query?.id)
      
      if (foundVault)
        setFoundVault(foundVault);
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
              showClaim={false}
            />

            <section className="w-full md:flex md:flex-row md:justify-between md:space-x-8 py-10 px-4 md:px-0">
              <div className="w-full md:w-1/3">
                {vaultData.metadata.type.includes("safe-vault")
                  ? <SafeVaultInteraction vaultData={vaultData} tokenOptions={tokenOptions} chainId={vaultData.chainId} hideModal={() => router.reload()} />
                  : <div className="bg-customNeutral200 p-6 rounded-lg">
                    <div className="bg-customNeutral300 px-6 py-6 rounded-lg">
                      <VaultInputs
                        vaultData={vaultData}
                        tokenOptions={tokenOptions}
                        chainId={vaultData.chainId}
                        hideModal={() => router.reload()}
                      />
                    </div>
                  </div>
                }
              </div>

              <div className="w-full md:w-2/3 mt-8 md:mt-0 space-y-4">
                {gauge && gauge?.balance.value > BigInt(0) && Object.keys(tokens).length > 0 && (vaultData.gaugeData?.lowerAPR || 0) > 0 &&
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

                <VaultInformation vaultData={vaultData} />

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
        : <SpinningLogo />
    }
  </NoSSR >
}