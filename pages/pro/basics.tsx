import { PRO_CREATION_STAGES } from "@/lib/stages";
import { useRouter } from "next/router";
import { atom, useAtom } from "jotai";
import { metadataAtom, assetAtom, protocolAtom, adapterAtom, strategyAtom } from "@/lib/atoms";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import AdapterSelection from "@/components/sections/AdapterSelection";
import MetadataConfiguration from "@/components/sections/MetadataConfiguration";
import AssetProtocolSelection from "@/components/sections/AssetProtocolSelection";
import VaultCreationContainer from "@/components/VaultCreationContainer";
import DepositLimitConfiguration from "@/components/sections/DepositLimitConfiguration";


export const basicsAtom = atom(get => ({
  metadata: get(metadataAtom),
  asset: get(assetAtom),
  protocol: get(protocolAtom),
  adapter: get(adapterAtom),
  strategy: get(strategyAtom),
}))

export function isBasicsValid (basics: any): boolean {
    if (basics.metadata.name.length < 3) return false;
    if (basics.asset.symbol === "none") return false;
    if (basics.protocol.key === "none") return false;
    if (basics.adapter.key === "none") return false;
    return true;
}

export default function Basics() {
    const router = useRouter();
    const [basics] = useAtom(basicsAtom)

    return (
        <VaultCreationContainer activeStage={0} stages={PRO_CREATION_STAGES} >
            <h1 className="text-[white] text-2xl mb-2">Set up a new vault</h1>

            <div className={`flex flex-col gap-6`}>
              <MetadataConfiguration />
              <AssetProtocolSelection />
              <AdapterSelection isDisabled={basics.asset.symbol === 'none' || basics.protocol.key === 'none'} />
              <DepositLimitConfiguration />
            </div>

            <div className="flex justify-end mt-8 gap-3">
                <SecondaryActionButton label="Back" handleClick={() => router.push('/')} className={`max-w-[100px]`} />
                <MainActionButton label="Next" handleClick={() => router.push('/pro/strategy')} className={`max-w-[100px]`} disabled={!isBasicsValid(basics)} />
            </div>
        </VaultCreationContainer>
    )
}
