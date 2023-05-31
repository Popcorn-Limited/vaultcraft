import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import ProgressBar from "@/components/ProgressBar";
import AdapterSelection from "@/components/sections/AdapterSelection";
import AssetSelection from "@/components/sections/AssetSelection";
import ProtocolSelection from "@/components/sections/ProtocolSelection";
import StrategySelection from "@/components/sections/StrategySelection";
import { CREATION_STAGES } from "@/lib/stages";
import { useRouter } from "next/router";

export default function Limits() {
  const router = useRouter();

  return (
    <div className="bg-[#141416] md:max-w-[800px] w-full h-full flex flex-col justify-center mx-auto md:px-8 px-6">
      <ProgressBar stages={CREATION_STAGES} activeStage={3} />
      <div className="md:bg-[#23262F] self-center min-h-[500px] bg-transparent h-fit rounded-[20px] border-[#23262F] border-2 md:border border-none md:w-[600px] md:p-6 px-0 flex flex-col justify-between mt-10 md:relative w-full">
        <h1 className="text-[white] text-2xl mb-2">Set up a new vault</h1>

        {/* @dev - We currently dont support naming vaults */}
        {/* <label className="text-[white] mb-3">Name</label>
                <Input
                    onChange={(e) =>
                        setBasicForm({ ...basicForm, name: (e.target as HTMLInputElement).value, })
                    }
                    value={basicForm.name}
                    defaultValue={''}
                    placeholder="Type vault name"
                    autoComplete="off"
                    autoCorrect="off"
                    className={`
                       border-1 border text-[white] border-[#353945] mb-4
                    `}
                /> */}

        <AssetSelection />
        <ProtocolSelection />
        <AdapterSelection />
        <StrategySelection />

        <div className="flex flex-row space-x-8">
          <SecondaryActionButton label="Back" handleClick={() => router.push('/create/strategy')} />
          <MainActionButton label="Next" handleClick={() => router.push('/create/fees')} />
        </div>

      </div>
    </div>
  )
}
