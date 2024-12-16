
export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full">
      <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-xl bg-customNeutral100">
        <div
          style={{ width: `${progress}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primaryGreen transition-all duration-300 ease-out"
        />
      </div>
    </div>
  );
};