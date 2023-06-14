import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import ProgressBar from "@/components/ProgressBar";
import AdapterConfiguration from "@/components/sections/AdapterConfiguration";
import { adapterAtom, adapterConfigAtom } from "@/lib/atoms";
import { verifyInitParamValidity } from "@/lib/helpers";
import { CREATION_STAGES } from "@/lib/stages";
import { useAtom } from "jotai";
import { useRouter } from "next/router";

export function isAdapterValid(adapter: any, adapterConfig: string[]): boolean {
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
    <div className="bg-[#141416] md:max-w-[800px] w-full h-full flex flex-col justify-center mx-auto md:px-8 px-6">
      <ProgressBar stages={CREATION_STAGES} activeStage={1} />
      <div className="md:bg-[#23262F] self-center min-h-[500px] bg-transparent h-fit rounded-[20px] border-[#23262F] border-2 md:border border-none md:w-[600px] md:p-6 px-0 flex flex-col justify-between mt-10 md:relative w-full">
        <div>
          <h1 className="text-white text-2xl mb-2">Adapter Configuration</h1>
          <p className="text-white">Configure your Adapter</p>
        </div>

        <AdapterConfiguration />

        <div className="flex flex-row space-x-8 mt-16">
          <SecondaryActionButton label="Back" handleClick={() => router.push('/create/basics')} />
          <MainActionButton label="Next" handleClick={() => router.push('/create/limits')} disabled={!isAdapterValid(adapter, adapterConfig)} />
        </div>

      </div>
    </div>
  )
}
