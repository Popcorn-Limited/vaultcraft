import { useRouter } from "next/router";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { CREATION_STAGES } from "@/lib/stages";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import ProgressBar from "@/components/ProgressBar";
import DepositLimitConfiguration from "@/components/sections/DepositLimitConfiguration";

export default function Limits() {
  const router = useRouter();

  return (
    <div className="bg-[#141416] md:max-w-[800px] w-full h-full flex flex-col justify-center mx-auto md:px-8 px-6">
      <ProgressBar stages={CREATION_STAGES} activeStage={2} />
      <div className="md:bg-[#23262F] self-center min-h-[500px] bg-transparent h-fit rounded-[20px] border-[#23262F] border-2 md:border border-none md:w-[600px] md:p-6 px-0 flex flex-col justify-between mt-10 md:relative w-full">
        <div>
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-white text-2xl mb-2">Deposit Limit</h1>
            <p className="text-gray-500">Optional</p>
          </div>

          <div className="border-2 border-[#353945] rounded-lg flex flex-row justify-between w-full px-2 py-3 h-full bg-[#23262F] text-white mt-4">
            <div className="flex flex-row">
              <ExclamationCircleIcon className="text-white w-16 h-16 mr-4 pb-2" />
              <p className="text-white text-sm">Deposits can be changed at any time after fund creation
                Settings in this section are restrictive. Enable them to control who can deposit in your vault, and in what amounts.
                If disabled, anyone can deposit any amount into your vault. </p>
            </div>
          </div>

          <div className="mt-6">
            <DepositLimitConfiguration />
          </div>
        </div>

        <div className="flex flex-row space-x-8">
          <SecondaryActionButton label="Back" handleClick={() => router.push('/create/adapter')} />
          <MainActionButton label="Next" handleClick={() => router.push('/create/fees')} />
        </div>

      </div>
    </div>
  )
}
