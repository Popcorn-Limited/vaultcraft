import { useRouter } from "next/router";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import DepositLimitConfiguration from "@/components/sections/DepositLimitConfiguration";
import VaultCreationContainer from "@/components/VaultCreationContainer";

export default function Limits() {
  const router = useRouter();

  return (
    <VaultCreationContainer activeStage={2} >
      <div>
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-white text-2xl mb-2">Deposit Limit</h1>
          <p className="text-gray-500">Optional</p>
        </div>

        <div className="border-2 border-[#353945] rounded-lg flex flex-row justify-between w-full px-2 py-3 h-full bg-[#23262F] text-white mt-4">
          <div className="flex flex-row">
            <ExclamationCircleIcon className="text-white w-16 h-16 mr-4 pb-2" />
            <p className="text-white text-sm">Deposits can be changed at any time after vault creation.
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
    </VaultCreationContainer>
  )
}
