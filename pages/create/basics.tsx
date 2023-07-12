import { useRouter } from "next/router";
import { atom, useAtom } from "jotai";
import { metadataAtom, assetAtom, protocolAtom, adapterAtom, strategyAtom } from "@/lib/atoms";
import MainActionButton from "@/components/buttons/MainActionButton";
import AdapterSelection from "@/components/sections/AdapterSelection";
import AssetSelection from "@/components/sections/AssetSelection";
import ProtocolSelection from "@/components/sections/ProtocolSelection";
import StrategySelection from "@/components/sections/StrategySelection";
import MetadataConfiguration from "@/components/sections/MetadataConfiguration";
import VaultCreationContainer from "@/components/VaultCreationContainer";
import DepositLimitConfiguration from "@/components/sections/DepositLimitConfiguration";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";


export const basicsAtom = atom((get) => {
    return {
        metadata: get(metadataAtom),
        asset: get(assetAtom),
        protocol: get(protocolAtom),
        adapter: get(adapterAtom),
        strategy: get(strategyAtom)
    }
})

export function isBasicsValid(basics: any): boolean {
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
        <VaultCreationContainer activeStage={0} >
            <h1 className="text-[white] text-2xl mb-2">Set up a new vault</h1>

            <MetadataConfiguration />
            <AssetSelection />
            <ProtocolSelection />
            <AdapterSelection />
            <StrategySelection />
            <DepositLimitConfiguration />

            <div className="w-full h-full flex flex-col justify-end md:grow mt-8">
                <MainActionButton label="Next" handleClick={() => router.push('/create/adapter')} disabled={!isBasicsValid(basics)} />
            </div>
        </VaultCreationContainer>
    )
}
