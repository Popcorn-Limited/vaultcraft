import { calcDaysToUnlock, calculateVeOut } from "@/lib/gauges/utils"

export default function IncreaseStakePreview({ amount, lockedBal }: { amount: string, lockedBal: { amount: bigint, end: bigint } }): JSX.Element {
  const val = Number(amount);
  const totalLocked = (Number(lockedBal?.amount) / 1e18) + val

  return (
    <div className="space-y-8 mb-8 text-start">

      <h2 className="text-start text-5xl">Preview Lock</h2>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Lock Amount</p>
          <p className="text-[#141416]">{val > 0 ? val.toFixed(2) : "0"} POP LP</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Total Locked</p>
          <p className="text-[#141416]">{lockedBal ? totalLocked.toFixed(2) : ""} POP LP</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlock Date</p>
          <p className="text-[#141416]">{lockedBal && lockedBal?.end.toString() !== "0" ? new Date(Number(lockedBal?.end) * 1000).toLocaleDateString() : "-"}</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>New Voting Power</p>
          <p className="text-[#141416]">{val > 0 ? calculateVeOut((Number(lockedBal?.amount) / 1e18) + val, calcDaysToUnlock(Number(lockedBal?.end))).toFixed(2) : "0"} vePOP</p>
        </div>
      </div>

      <div className="w-full bg-[#d7d7d726] border border-customLightGray rounded-lg p-4">
        <p className="text-primaryDark">Important: vePOP is not transferrable and unlocking POP LP early results in a penalty of up to 75% of your POP LP</p>
      </div>

    </div >
  )
}