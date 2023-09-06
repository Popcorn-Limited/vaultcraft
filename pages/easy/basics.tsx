import { BASIC_CREATION_STAGES } from "@/lib/stages";
import { useRouter } from "next/router";
import { atom, useAtom } from "jotai";
import { metadataAtom, assetAtom, protocolAtom, adapterAtom, strategyAtom, Asset, assetAddressesAtom, availableAssetsAtom, networkAtom, adapterConfigAtom, strategyConfigAtom, adapterDeploymentAtom, strategyDeploymentAtom } from "@/lib/atoms";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import AdapterSelection from "@/components/sections/AdapterSelection";
import MetadataConfiguration from "@/components/sections/MetadataConfiguration";
import VaultCreationContainer from "@/components/VaultCreationContainer";
import DepositLimitConfiguration from "@/components/sections/DepositLimitConfiguration";
import StrategySelection from "@/components/sections/StrategySelection";
import { useEffect, useState } from "react";
import AssetSelection from "@/components/sections/AssetSelection";
import ProtocolSelection from "@/components/sections/ProtocolSelection";
import { ethers } from "ethers";
import { resolveStrategyDefaults } from "@/lib/resolver/strategyDefaults/strategyDefaults";
import { resolveStrategyEncoding } from "@/lib/resolver/strategyEncoding/strategyDefaults";


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

async function getSupportedAssetAddressesByChain(chainId: number): Promise<{ [key: string]: string[] }> {
  // TODO actually fetch addresses
  return { all: [""] }
}

export default function Basics() {
  const router = useRouter();
  const [basics] = useAtom(basicsAtom)
  const [strategy] = useAtom(strategyAtom);
  const [network] = useAtom(networkAtom);
  const [asset] = useAtom(assetAtom);

  const [loading, setLoading] = useState(false)

  const [adapterData, setAdapterData] = useAtom(adapterDeploymentAtom);
  const [strategyData, setStrategyData] = useAtom(strategyDeploymentAtom);

  const [strategyConfig, setStrategyConfig] = useAtom(strategyConfigAtom);


  const [, setAvailableAssetAddresses] = useAtom(assetAddressesAtom);

  useEffect(() => { getSupportedAssetAddressesByChain(1).then(res => setAvailableAssetAddresses({ 1: res })) }, [])

  useEffect(() => {
    // @ts-ignore
    async function getStrategyDefaultsAndEncode() {
      setLoading(true)
      let adapterId = ethers.utils.formatBytes32String("")
      let adapterInitParams = "0x"

      let strategyId = ethers.utils.formatBytes32String("")
      let strategyInitParams = "0x"

      let strategyDefaults = []

      if (strategy.name.includes("Depositor")) {
        adapterId = ethers.utils.formatBytes32String(strategy.key)

        if (strategy.initParams && strategy.initParams.length > 0) {
          strategyDefaults = await resolveStrategyDefaults({
            chainId: network.id,
            address: asset.address[network.id].toLowerCase(),
            resolver: strategy.resolver
          })
          adapterInitParams = ethers.utils.defaultAbiCoder.encode(
            strategy.initParams.map((param) => param.type),
            strategyDefaults
          )
        }
      } else {
        adapterId = ethers.utils.formatBytes32String((strategy.adapter as string))
        strategyId = ethers.utils.formatBytes32String((strategy.key as string))

        strategyDefaults = await resolveStrategyDefaults({
          chainId: network.id,
          address: asset.address[network.id].toLowerCase(),
          resolver: strategy.resolver
        })
        console.log({ strategyDefaults, initParams: strategy.initParams })
        adapterInitParams = ethers.utils.defaultAbiCoder.encode(
          // @ts-ignore
          [strategy.initParams[0]],
          [strategyDefaults[0]]
        )

        strategyInitParams = await resolveStrategyEncoding({
          chainId: network.id,
          address: asset.address[network.id],
          params: strategyDefaults.slice(1),
          resolver: strategy.resolver
        })
      }
      console.log({
        adapter: {
          id: adapterId,
          data: adapterInitParams,
        },
        strategy: {
          id: strategyId,
          data: strategyInitParams
        }
      })
      setAdapterData({
        id: adapterId,
        data: adapterInitParams,
      });

      setStrategyData({
        id: strategyId,
        data: strategyInitParams
      });
      setLoading(false)
    }

    if (strategy.key !== "none") getStrategyDefaultsAndEncode();
  }, [strategy])

  return (
    <VaultCreationContainer activeStage={0} stages={BASIC_CREATION_STAGES} >
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
        <StrategySelection isDisabled={basics.protocol.key === "none"} />
        <DepositLimitConfiguration />
      </div>
      {strategy.key !== "none" && loading && <p className="text-white mt-6">Loading Configuration, please wait...</p>}
      <div className="flex justify-end mt-8 gap-3">
        <SecondaryActionButton
          label="Back"
          handleClick={() => router.push('/')}
          className={`max-w-[100px]`}
        />
        <MainActionButton
          label="Next"
          handleClick={() => router.push('/easy/fees')}
          className={`max-w-[100px]`}
          disabled={!isBasicsValid(basics) || loading}
        />
      </div>
    </VaultCreationContainer>
  )
}
