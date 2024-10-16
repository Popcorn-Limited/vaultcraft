import { useState } from "react"

export default function Test() {
  const [progress, setProgress] = useState(0)
  return <div className="text-white mt-8 w-full h-screen bg-black bg-opacity-50">
    <ProgressBar progress={progress} />
    <div className="mt-40">
      <SpinningLogo />
    </div>
  </div>
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full">
      <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-xl bg-customNeutral100">
        <div
          style={{ width: `${progress}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primaryYellow transition-all duration-300 ease-out"
        />
      </div>
    </div>
  );
};

const SpinningLogo = () => {
  return (
    <div className="flex justify-center items-center">
      <img
        src="images/icons/popLogo.svg"
        alt="Pop Logo"
        className="w-24 h-24 animate-spin-slow"
      />
    </div>
  );
};