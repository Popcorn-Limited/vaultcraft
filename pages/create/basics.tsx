import { useRouter } from "next/router";
import { atom, useAtom } from "jotai";
import { CREATION_STAGES } from "@/lib/stages";
import { metadataAtom, assetAtom, protocolAtom, adapterAtom, strategyAtom } from "@/lib/atoms";
import MainActionButton from "@/components/buttons/MainActionButton";
import ProgressBar from "@/components/ProgressBar";
import AdapterSelection from "@/components/sections/AdapterSelection";
import AssetSelection from "@/components/sections/AssetSelection";
import ProtocolSelection from "@/components/sections/ProtocolSelection";
import StrategySelection from "@/components/sections/StrategySelection";
import MetadataConfiguration from "@/components/sections/MetadataConfiguration";


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
        <div className="bg-[#141416] md:max-w-[800px] w-full h-full flex flex-col justify-center mx-auto md:px-8 px-6">
            <ProgressBar stages={CREATION_STAGES} activeStage={0} />
            <div className="flex md:bg-[#23262F] self-center min-h-[500px] bg-transparent h-full rounded-[20px] border-[#23262F] border-2 md:border border-none md:w-[600px] md:p-6 px-0 flex-col justify-start mt-10 md:relative w-full">
                <h1 className="text-[white] text-2xl mb-2">Set up a new vault</h1>

                <MetadataConfiguration />
                <AssetSelection />
                <ProtocolSelection />
                <AdapterSelection />
                <StrategySelection />

                <div className="w-full h-full flex flex-col justify-end md:grow mt-8">
                    <MainActionButton label="Next" handleClick={() => router.push('/create/adapter')} disabled={!isBasicsValid(basics)} />
                </div>

            </div>
        </div>
    )
}
