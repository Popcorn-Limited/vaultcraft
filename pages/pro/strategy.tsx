import { PRO_CREATION_STAGES } from "@/lib/stages";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { adapterAtom, adapterConfigAtom } from "@/lib/atoms";
import { verifyInitParamValidity } from "@/lib/helpers";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import VaultCreationContainer from "@/components/VaultCreationContainer";
import StrategyConfiguration from "@/components/sections/StrategyConfiguration";

export function isConfigValid(adapter: any, adapterConfig: string[]): boolean {
  if (adapter.initParams && adapter.initParams.length > 0) {
    return adapterConfig.every((param: string, i: number) => verifyInitParamValidity(param, adapter.initParams[i]).length === 0)
  }
  return true;
}

export default function Strategy() {
  const router = useRouter();
  const [adapter] = useAtom(adapterAtom);
  const [adapterConfig] = useAtom(adapterConfigAtom)

  return (
    <VaultCreationContainer activeStage={1} stages={PRO_CREATION_STAGES} >
      <div className={`mb-6`}>
        <h1 className="text-white text-2xl mb-2">Strategy Configuration</h1>
        <p className="text-white">Configure your Strategy</p>
      </div>

      <StrategyConfiguration />

      <div className="flex justify-end gap-3 mt-6">
        <SecondaryActionButton label="Back" className={`max-w-[100px]`} handleClick={() => router.push('/pro/basics')} />
        <MainActionButton label="Next" className={`max-w-[100px]`} handleClick={() => router.push('/pro/fees')} disabled={!isConfigValid(adapter, adapterConfig)} />
      </div>
    </VaultCreationContainer >
  )
}
