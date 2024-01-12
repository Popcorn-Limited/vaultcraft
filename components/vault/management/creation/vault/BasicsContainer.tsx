import { useRouter } from "next/router";
import { atom, useAtom } from "jotai";
import { metadataAtom, assetAtom, protocolAtom, strategyAtom, assetAddressesAtom, strategyConfigAtom } from "@/lib/atoms";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import MetadataConfiguration from "@/components/deploymentSections/MetadataConfiguration";
import VaultCreationCard from "@/components/vault/management/creation/VaultCreationCard";
import DepositLimitConfiguration from "@/components/deploymentSections/DepositLimitConfiguration";
import StrategySelection from "@/components/deploymentSections/StrategySelection";
import { useEffect, useState } from "react";
import AssetSelection from "@/components/deploymentSections/AssetSelection";
import ProtocolSelection from "@/components/deploymentSections/ProtocolSelection";
import { resolveStrategyDefaults } from "@/lib/resolver/strategyDefaults/strategyDefaults";
import { Address, getAddress } from "viem";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { usePublicClient, useWalletClient } from "wagmi";
import { VaultCreationContainerProps } from ".";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";

export const basicsAtom = atom(get => ({
  metadata: get(metadataAtom),
  asset: get(assetAtom),
  protocol: get(protocolAtom),
  strategy: get(strategyAtom),
}))

export function isBasicsValid(basics: any): boolean {
  if (basics.metadata.name.length < 3) return false;
  if (basics.asset.symbol === "none") return false;
  if (basics.protocol.key === "none") return false;
  return true;
}

export default function BasicsContainer({ route, stages, activeStage }: VaultCreationContainerProps): JSX.Element {
  const router = useRouter();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()

  const [yieldOptions] = useAtom(yieldOptionsAtom);

  const [basics] = useAtom(basicsAtom)
  const [strategy] = useAtom(strategyAtom);
  const [asset] = useAtom(assetAtom);

  const [loading, setLoading] = useState(false)

  const [, setStrategyConfig] = useAtom(strategyConfigAtom);

  const [availableAssetAddresses, setAvailableAssetAddresses] = useAtom(assetAddressesAtom);

  useEffect(() => {
    if (!!yieldOptions && availableAssetAddresses) {
      const newAvailableAssetAddresses: { [key: number]: Address[] } = {}
      SUPPORTED_NETWORKS.forEach(async (chain) => newAvailableAssetAddresses[chain.id] = await yieldOptions.getAssets(chain.id))
      setAvailableAssetAddresses(newAvailableAssetAddresses);
    }
  }, [yieldOptions])

  useEffect(() => {
    // @ts-ignore
    async function getStrategyDefaults() {
      setLoading(true)
      const chainId = walletClient?.chain.id || 1

      let strategyDefaults = []

      if (strategy.name.includes("Depositor")) {
        if (strategy.initParams && strategy.initParams.length > 0) {
          strategyDefaults = await resolveStrategyDefaults({
            chainId: chainId,
            client: publicClient,
            address: getAddress(asset.address[chainId]),
            resolver: strategy.resolver
          })
        }
      } else {
        strategyDefaults = await resolveStrategyDefaults({
          chainId: chainId,
          client: publicClient,
          address: getAddress(asset.address[chainId]),
          resolver: strategy.resolver
        })
      }
      setStrategyConfig(strategyDefaults)
      setLoading(false)
    }

    if (strategy.key !== "none") getStrategyDefaults();
  }, [strategy])

  return (
    <VaultCreationCard activeStage={activeStage} stages={stages} >
      <div className="mb-6">
        <h1 className="text-[white] text-2xl mb-2">Set up a new vault</h1>
        <p className="text-white">
          Choose a name for your vault, than select an asset and see what protocols have to offer.
        </p>
      </div>

      <div className={`flex flex-col gap-6`}>
        <MetadataConfiguration />
        <div className="flex flex-col md:flex-row gap-6 md:gap-4">
          <AssetSelection />
          <ProtocolSelection />
        </div>
        <div>
          <StrategySelection isDisabled={basics.protocol.key === "none"} />
          <p className="text-gray-500 text-sm mt-1" >
            To learn more click
            <a href="https://docs.vaultcraft.io/products/smart-vaults/strategies" className="text-blue-500">
              here
            </a>
          </p>
        </div>
        <DepositLimitConfiguration />
      </div>

      {strategy.key !== "none" && loading && <p className="text-white mt-6">Loading Configuration, please wait...</p>}

      <div className="flex justify-end mt-8 gap-3">
        <SecondaryActionButton
          label="Back"
          handleClick={() => router.push('/create-vault')}
        />
        <MainActionButton
          label="Next"
          handleClick={() => router.push(`/create-vault/${route}`)}
          disabled={!isBasicsValid(basics) || loading}
        />
      </div>
    </VaultCreationCard>
  )
}