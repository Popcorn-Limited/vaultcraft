import { useRouter } from "next/router";
import { noOp } from "@/lib/helpers";
import { CREATION_STAGES } from "@/lib/stages";
import { useDeployVault } from "@/lib/vaults";
import ProgressBar from "@/components/ProgressBar";
import Review from "@/components/review/Review";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";


export default function ReviewPage(): JSX.Element {
  const router = useRouter();

  const { write: deployVault = noOp } = useDeployVault();


  return (
    <div className="bg-[#141416] md:max-w-[800px] w-full h-full flex flex-col justify-center mx-auto md:px-8 px-6">
      <ProgressBar stages={CREATION_STAGES} activeStage={4} />
      <div className="md:bg-[#23262F] self-center min-h-[500px] bg-transparent h-fit rounded-[20px] border-[#23262F] border-2 md:border border-none md:w-[600px] md:p-6 px-0 flex flex-col justify-between mt-10 md:relative w-full">
        <div>
          <h1 className="text-white text-2xl mb-2">Review</h1>
          <p className="text-white">
            Please review the vault configuration carefully before creating.
            All configuration settings are permanent
          </p>
        </div>

        <Review />

        <div className="flex flex-row space-x-8 mt-16">
          <SecondaryActionButton
            label="Back"
            handleClick={() => router.push('/create/fees')}
          />
          <MainActionButton
            label="Deploy Vault"
            handleClick={() => {
              console.log("done");
              deployVault();
            }}
          />
        </div>

      </div>
    </div>
  )
}
