import ProgressBar, { ProgressBarProps } from "@/components/vaultManagement/creation/ProgressBar";

interface VaultCreationCardProps extends ProgressBarProps {
  children: any
}

export default function VaultCreationCard({ activeStage, children, stages }: VaultCreationCardProps): JSX.Element {
  return (
    <div className="bg-[#141416] md:max-w-[800px] w-full h-full flex flex-col justify-center mx-auto md:px-8 px-6">
      <ProgressBar stages={stages} activeStage={activeStage} />
      <div className="md:bg-[#23262F] self-center bg-transparent h-fit md:rounded-[20px] border-[#23262F] border-2 md:border border-none md:w-[600px] md:p-6 px-0 flex flex-col justify-between mt-10 md:relative w-full">
        {children}
      </div>
    </div>
  )
}