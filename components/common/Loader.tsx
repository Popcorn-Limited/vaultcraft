import ProgressBar from "@/components/common/ProgressBar";
import SpinningLogo from "@/components/common/SpinningLogo";

export default function Loader({ progress }: { progress: number }) {
  return progress < 100 ? (
    <div className="">
      <ProgressBar progress={progress} />
      <div className="mt-12">
        <SpinningLogo />
      </div>
    </div >
  )
    : <></>
}