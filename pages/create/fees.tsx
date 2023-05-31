import MainActionButton from "@/components/Buttons/MainActionButton";
import SecondaryActionButton from "@/components/Buttons/SecondaryActionButton";
import ProgressBar from "@/components/ProgressBar";
import AdapterSelection from "@/components/sections/AdapterSelection";
import AssetSelection from "@/components/sections/AssetSelection";
import FeeConfiguration from "@/components/sections/FeeConfiguration";
import ProtocolSelection from "@/components/sections/ProtocolSelection";
import StrategySelection from "@/components/sections/StrategySelection";
import { basicAtom } from "@/lib/basic";
import { stages } from "@/lib/stage";
import { useAtom } from "jotai";
import { useRouter } from "next/router";

export default function Fees() {
  const router = useRouter();

  return (
    <div className="bg-[#141416] md:max-w-[800px] w-full h-full flex flex-col justify-center mx-auto md:px-8 px-6">
      <ProgressBar stages={stages} activeStage={1} />
      <div className="md:bg-[#23262F] self-center min-h-[500px] bg-transparent h-fit rounded-[20px] border-[#23262F] border-2 md:border border-none md:w-[600px] md:p-6 px-0 flex flex-col justify-between mt-10 md:relative w-full">
        <div>
          <h1 className="text-white text-2xl mb-2">Fee Configuration</h1>
          <p className="text-white">Vault managers can charge several types of fees, all of which are paid out in shares of the vault.  Fees can be changed at any time after fund creation</p>
        </div>

        <FeeConfiguration />

        <div className="flex flex-row space-x-8 mt-16">
          <SecondaryActionButton label="Back" handleClick={() => router.push('/create/basics')} />
          <MainActionButton label="Next" handleClick={() => router.push('/create/limits')} />
        </div>

      </div>
    </div>
  )
}
