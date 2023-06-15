import { CREATION_STAGES } from "@/lib/stages";
import ProgressBar from "./ProgressBar";

export default function VaultCreationContainer({ activeStage, children }: { activeStage: number, children: any }): JSX.Element {
  return (
    <div className="bg-[#141416] md:max-w-[800px] w-full h-full flex flex-col justify-center mx-auto md:px-8 px-6">
      <ProgressBar stages={CREATION_STAGES} activeStage={activeStage} />
      <div className="md:bg-[#23262F] self-center min-h-[500px] bg-transparent h-fit rounded-[20px] border-[#23262F] border-2 md:border border-none md:w-[600px] md:p-6 px-0 flex flex-col justify-between mt-10 md:relative w-full">
        {children}
      </div>
    </div>
  )
}