import { calcUnlockTime, calculateVeOut } from "@/lib/gauges/utils";

export default function LockPreview({ amount, days }: { amount: string, days: number }): JSX.Element {
  const val = Number(amount);
  return (
    <div className="space-y-8 mb-8 text-start">

      <h2 className="text-start text-5xl">Preview Lock</h2>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Lock Amount</p>
          <p>{val > 0 ? val.toFixed(2) : "0"} VCX</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlock Date</p>
          <p>{new Date(calcUnlockTime(days)).toLocaleDateString()}</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Initial Voting Power</p>
          <p>{val > 0 ? calculateVeOut(val, days).toFixed(2) : "0"}</p>
        </div>
      </div>

      <div className="w-full border border-customLightGray rounded-lg p-4">
        <p className="text-primaryDark">Important: veVCX is not transferrable and unlocking VCX-LP early results in a penalty of up to 75% of your VCX-LP</p>
      </div>

    </div >
  )
}