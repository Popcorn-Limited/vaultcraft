import { useRouter } from "next/router";
import { CREATION_STAGES } from "@/lib/stages";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import ProgressBar from "@/components/ProgressBar";

export default function Strategy() {
  const router = useRouter();

  return (
    <div className="bg-[#141416] md:max-w-[800px] w-full h-full flex flex-col justify-center mx-auto md:px-8 px-6">
      <ProgressBar stages={CREATION_STAGES} activeStage={2} />
      <div className="md:bg-[#23262F] self-center min-h-[500px] bg-transparent h-fit rounded-[20px] border-[#23262F] border-2 md:border border-none md:w-[600px] md:p-6 px-0 flex flex-col justify-between mt-10 md:relative w-full">
        <div>
          <h1 className="text-white text-2xl mb-2">Strategy Configuration</h1>
          <p className="text-white">Configure your Strategy</p>
        </div>

        <p className="text-white">Coming Soon</p>
        {/* <StrategyConfiguration /> */}

        <div className="flex flex-row space-x-8 mt-16">
          <SecondaryActionButton label="Back" handleClick={() => router.push('/create/adapter')} />
          <MainActionButton label="Next" handleClick={() => router.push('/create/limits')} />
        </div>

      </div>
    </div>
  )
}
