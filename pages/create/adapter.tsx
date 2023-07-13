import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { adapterAtom, adapterConfigAtom } from "@/lib/atoms";
import { verifyInitParamValidity } from "@/lib/helpers";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import AdapterConfiguration from "@/components/sections/AdapterConfiguration";
import VaultCreationContainer from "@/components/VaultCreationContainer";


export function isConfigValid(adapter: any, adapterConfig: string[]): boolean {
  if (adapter.initParams && adapter.initParams.length > 0) {
    return adapterConfig.every((param: string, i: number) => verifyInitParamValidity(param, adapter.initParams[i]).length === 0)
  }
  return true;
}

export default function Adapter() {
  const router = useRouter();
  const [adapter] = useAtom(adapterAtom);
  const [adapterConfig] = useAtom(adapterConfigAtom)

  return (
    <VaultCreationContainer activeStage={1} >
      <div>
        <h1 className="text-white text-2xl mb-2">Adapter Configuration</h1>
        <p className="text-white">Configure your Adapter</p>
      </div>

      <AdapterConfiguration />

      <div className="flex flex-row space-x-8 mt-16">
        <SecondaryActionButton label="Back" handleClick={() => router.push('/create/basics')} />
        <MainActionButton label="Next" handleClick={() => router.push('/create/strategy')} disabled={!isConfigValid(adapter, adapterConfig)} />
      </div>
    </VaultCreationContainer >
  )
}
