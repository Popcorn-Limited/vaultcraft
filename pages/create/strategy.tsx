import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { adapterAtom, adapterConfigAtom } from "@/lib/atoms";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import VaultCreationContainer from "@/components/VaultCreationContainer";
import StrategyConfiguration from "@/components/sections/StrategyConfiguration";
import { isConfigValid } from "./adapter";


export default function Strategy() {
  const router = useRouter();
  const [adapter] = useAtom(adapterAtom);
  const [adapterConfig] = useAtom(adapterConfigAtom)

  return (
    <VaultCreationContainer activeStage={2} >
      <div>
        <h1 className="text-white text-2xl mb-2">Strategy Configuration</h1>
        <p className="text-white">Configure your Strategy</p>
      </div>

      <StrategyConfiguration />

      <div className="flex flex-row space-x-8 mt-16">
        <SecondaryActionButton label="Back" handleClick={() => router.push('/create/adapter')} />
        <MainActionButton label="Next" handleClick={() => router.push('/create/fees')} disabled={!isConfigValid(adapter, adapterConfig)} />
      </div>
    </VaultCreationContainer >
  )
}
